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
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    use ApiResponse;

    public function __construct(
        private InvoiceService $invoiceService,
        private PaymentService $paymentService,
        private FinanceService $financeService
    ) {}

    public function index(Request $request): JsonResponse
    {
        return $this->paginatedResponse(
            $this->invoiceService->index($request->only(['student_id', 'status', 'term', 'search', 'per_page', 'page'])),
            'Invoices retrieved successfully.'
        );
    }

    public function store(StoreInvoiceRequest $request): JsonResponse
    {
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

        return $this->successResponse($invoice, 'Invoice retrieved successfully.');
    }

    public function update(UpdateInvoiceRequest $request, int $id): JsonResponse
    {
        try {
            $invoice = Invoice::findOrFail($id);
            $invoice = $this->invoiceService->update(
                auth()->user(),
                $invoice,
                $request->validated(),
                $request->input('items', [])
            );
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Invoice not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse($invoice, 'Invoice updated.');
    }

    public function generate(GenerateInvoicesRequest $request): JsonResponse
    {
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
            $invoice = $this->invoiceService->issue(Invoice::findOrFail($id));
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Invoice not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse($invoice, 'Invoice issued.');
    }

    public function void(int $id): JsonResponse
    {
        try {
            $invoice = $this->invoiceService->void(Invoice::findOrFail($id));
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Invoice not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse($invoice, 'Invoice voided.');
    }

    public function recordPayment(RecordPaymentRequest $request, int $id): JsonResponse
    {
        try {
            $invoice = Invoice::findOrFail($id);
            $payment = $this->paymentService->recordForInvoice(
                auth()->user(),
                $invoice,
                (float) $request->input('amount'),
                $request->input('method'),
                $request->input('reference'),
                $request->input('paid_at')
            );
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Invoice not found.');
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

            if ($invoice->status !== 'draft') {
                return $this->errorResponse('Only draft invoices can be deleted.', 422);
            }

            $invoice->delete();
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Invoice not found.');
        }

        return $this->noContentResponse('Invoice deleted.');
    }

    public function mine(Request $request): JsonResponse
    {
        $studentIds = $this->financeService->accessibleStudentIds();
        $invoices = $this->invoiceService->forUser(auth()->user(), $studentIds);

        return $this->successResponse($invoices, 'Invoices retrieved successfully.');
    }
}
