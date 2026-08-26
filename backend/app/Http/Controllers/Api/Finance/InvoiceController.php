<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\GenerateInvoicesRequest;
use App\Http\Requests\Finance\RecordPaymentRequest;
use App\Http\Requests\Finance\StoreInvoiceRequest;
use App\Http\Requests\Finance\UpdateInvoiceRequest;
use App\Models\Invoice;
use App\Services\Finance\FinanceService;
use App\Services\Finance\InvoiceService;
use App\Services\Finance\PaymentService;
use App\Services\Pdf\DocumentPdfService;
use App\Traits\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InvoiceController extends Controller
{
    use ApiResponse;

    public function __construct(
        private InvoiceService $invoiceService,
        private PaymentService $paymentService,
        private FinanceService $financeService,
        private DocumentPdfService $pdf
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Invoice::class);

        return $this->paginatedResponse(
            $this->invoiceService->index($request->only(['student_id', 'status', 'term', 'search', 'per_page', 'page'])),
            'Invoices retrieved successfully.'
        );
    }

    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        $this->authorize('create', Invoice::class);

        try {
            $invoice = $this->invoiceService->create(
                auth()->user(),
                $request->validated(),
                $request->input('items', [])
            );
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->createdResponse($invoice, 'Invoice created.');
    }

    public function show(int $id): JsonResponse
    {
        try {
            $invoice = $this->invoiceService->show($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Invoice not found.');
        }

        $this->authorize('view', $invoice);

        return $this->successResponse($invoice, 'Invoice retrieved successfully.');
    }

    public function pdf(int $id): StreamedResponse
    {
        try {
            $invoice = $this->invoiceService->show($id);
        } catch (ModelNotFoundException) {
            abort(404, 'Invoice not found.');
        }

        $this->authorize('view', $invoice);

        $student = $invoice->student;
        $amount = number_format((float) $invoice->amount, 2);
        $paid = number_format((float) $invoice->paid_amount, 2);
        $balance = number_format((float) $invoice->balance, 2);

        $details = $this->pdf->detailsBox([
            'Invoice No' => $invoice->invoice_no,
            'Student' => $student ? $student->full_name . ' (' . $student->student_id . ')' : '—',
            'Term' => $invoice->term,
            'Description' => $invoice->description,
            'Issued' => $invoice->issued_at?->format('M j, Y'),
            'Due Date' => $invoice->due_date?->format('M j, Y'),
            'Status' => ucfirst($invoice->status),
        ]);

        $itemRows = $invoice->items->map(fn ($item) => [
            $item->description,
            $item->qty,
            number_format((float) $item->amount, 2),
            number_format((float) $item->total, 2),
        ])->all();

        $items = $this->pdf->table(
            ['Description', 'Qty', 'Unit Price', 'Total'],
            $itemRows
        );

        $totals = '<div class="doc-box mt-2" style="max-width: 320px; margin-left: auto;">'
            . '<table class="doc-dl">'
            . '<tr><td>Amount</td><td class="text-right">' . $amount . '</td></tr>'
            . '<tr><td>Paid</td><td class="text-right">' . $paid . '</td></tr>'
            . '<tr class="doc-total"><td>Balance</td><td class="text-right">' . $balance . '</td></tr>'
            . '</table></div>';

        $content = '<div class="doc-section"><div class="doc-section-title">Invoice Details</div>' . $details . '</div>'
            . '<div class="doc-section"><div class="doc-section-title">Items</div>' . $items . '</div>'
            . $totals;

        return $this->pdf->download(
            'Invoice',
            $content,
            $invoice->invoice_no . '.pdf',
            ['document_no' => $invoice->invoice_no]
        );
    }

    public function update(UpdateInvoiceRequest $request, int $id): JsonResponse
    {
        try {
            $invoice = Invoice::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Invoice not found.');
        }

        $this->authorize('update', $invoice);

        try {
            $invoice = $this->invoiceService->update(
                auth()->user(),
                $invoice,
                $request->validated(),
                $request->input('items', [])
            );
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse($invoice, 'Invoice updated.');
    }

    public function generate(GenerateInvoicesRequest $request): JsonResponse
    {
        $this->authorize('generate', Invoice::class);

        try {
            $count = $this->invoiceService->generateFromStructure(
                auth()->user(),
                (int) $request->input('fee_structure_id'),
                $request->input('grade_level')
            );
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse(['created' => $count], "{$count} invoice(s) generated.");
    }

    public function issue(int $id): JsonResponse
    {
        try {
            $invoice = Invoice::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Invoice not found.');
        }

        $this->authorize('issue', $invoice);

        try {
            $invoice = $this->invoiceService->issue($invoice);
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse($invoice, 'Invoice issued.');
    }

    public function void(int $id): JsonResponse
    {
        try {
            $invoice = Invoice::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Invoice not found.');
        }

        $this->authorize('void', $invoice);

        try {
            $invoice = $this->invoiceService->void($invoice);
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse($invoice, 'Invoice voided.');
    }

    public function recordPayment(RecordPaymentRequest $request, int $id): JsonResponse
    {
        try {
            $invoice = Invoice::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Invoice not found.');
        }

        $this->authorize('recordPayment', $invoice);

        try {
            $payment = $this->paymentService->recordForInvoice(
                auth()->user(),
                $invoice,
                (float) $request->input('amount'),
                $request->input('method'),
                $request->input('reference'),
                $request->input('paid_at')
            );
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }

        return $this->createdResponse(
            $payment->load(['invoice.student', 'paidBy:id,name']),
            'Payment recorded. Receipt generated.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $invoice = Invoice::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Invoice not found.');
        }

        $this->authorize('delete', $invoice);

        if ($invoice->status !== 'draft') {
            return $this->errorResponse('Only draft invoices can be deleted.', 422);
        }

        $invoice->delete();

        return $this->noContentResponse('Invoice deleted.');
    }

    public function mine(Request $request): JsonResponse
    {
        $studentIds = $this->financeService->accessibleStudentIds();
        $invoices = $this->invoiceService->forUser(auth()->user(), $studentIds);

        return $this->successResponse($invoices, 'Invoices retrieved successfully.');
    }
}
