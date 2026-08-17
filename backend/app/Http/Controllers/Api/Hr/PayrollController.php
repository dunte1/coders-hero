<?php

namespace App\Http\Controllers\Api\Hr;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hr\MarkPayrollPaidRequest;
use App\Http\Requests\Hr\RunPayrollRequest;
use App\Http\Resources\Hr\PayrollResource;
use App\Http\Resources\Hr\PayslipResource;
use App\Models\Payslip;
use App\Services\Hr\HrService;
use App\Services\Hr\PayrollService;
use App\Services\Pdf\DocumentPdfService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PayrollController extends Controller
{
    use ApiResponse;

    public function __construct(
        private PayrollService $payrollService,
        private HrService $hrService,
        private DocumentPdfService $pdf
    ) {}

    public function index(Request $request): JsonResponse
    {
        return $this->paginatedResponse(
            $this->payrollService->index($request->only(['month', 'status', 'per_page', 'page'])),
            'Payrolls retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(
            new PayrollResource($this->payrollService->show($id)),
            'Payroll retrieved successfully.'
        );
    }

    public function run(RunPayrollRequest $request): JsonResponse
    {
        try {
            $payroll = $this->payrollService->run($request->get('month'), auth()->user());
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }

        return $this->createdResponse(
            new PayrollResource($payroll),
            'Payroll generated successfully.'
        );
    }

    public function process(int $id): JsonResponse
    {
        try {
            $payroll = $this->payrollService->process($id, auth()->user());
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }

        return $this->successResponse(
            new PayrollResource($payroll),
            'Payroll processed successfully.'
        );
    }

    public function markPaid(MarkPayrollPaidRequest $request, int $id): JsonResponse
    {
        try {
            $payroll = $this->payrollService->markPaid($id, $request->only(['payment_method']), auth()->user());
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }

        return $this->successResponse(
            new PayrollResource($payroll),
            'Payroll marked as paid successfully.'
        );
    }

    public function cancel(int $id): JsonResponse
    {
        try {
            $payroll = $this->payrollService->cancel($id, auth()->user());
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }

        return $this->successResponse(
            new PayrollResource($payroll),
            'Payroll cancelled successfully.'
        );
    }

    public function payslip(int $id): JsonResponse
    {
        return $this->successResponse(
            new PayslipResource($this->payrollService->payslip($id)),
            'Payslip retrieved successfully.'
        );
    }

    public function payslipPdf(int $id): StreamedResponse
    {
        return $this->renderPayslipPdf($this->payrollService->payslip($id));
    }

    public function myPayslips(Request $request): JsonResponse
    {
        $employee = $this->hrService->employeeForUser(auth()->user());

        if (!$employee) {
            return $this->forbiddenResponse('Only employees can access their own payslips.');
        }

        return $this->paginatedResponse(
            $this->payrollService->myPayslips($employee->id, $request->only(['status', 'per_page', 'page'])),
            'Payslips retrieved successfully.'
        );
    }

    public function myPayslip(int $id): JsonResponse
    {
        $employee = $this->hrService->employeeForUser(auth()->user());

        if (!$employee) {
            return $this->forbiddenResponse('Only employees can access their own payslips.');
        }

        $payslip = Payslip::where('id', $id)->where('employee_id', $employee->id)->first();

        if (!$payslip) {
            return $this->notFoundResponse('Payslip not found.');
        }

        return $this->successResponse(
            new PayslipResource($payslip->load(['employee.user', 'employee.department', 'employee.position', 'payroll'])),
            'Payslip retrieved successfully.'
        );
    }

    public function myPayslipPdf(int $id): StreamedResponse
    {
        $employee = $this->hrService->employeeForUser(auth()->user());

        if (!$employee) {
            abort(403, 'Only employees can access their own payslips.');
        }

        $payslip = Payslip::where('id', $id)->where('employee_id', $employee->id)->firstOrFail();

        return $this->renderPayslipPdf(
            $payslip->load(['employee.user', 'employee.department', 'employee.position', 'payroll'])
        );
    }

    private function renderPayslipPdf(Payslip $payslip): StreamedResponse
    {
        $employee = $payslip->employee;
        $user = $employee?->user;
        $payroll = $payslip->payroll;

        $money = fn ($v) => number_format((float) $v, 2);

        $details = $this->pdf->detailsBox([
            'Payroll No' => $payroll?->payroll_no,
            'Period' => $payroll?->month,
            'Employee' => $user ? $user->name : $employee?->employee_id,
            'Employee ID' => $employee?->employee_id,
            'Department' => $employee?->department?->name,
            'Position' => $employee?->position?->name,
            'Status' => ucfirst($payslip->status),
            'Payment Method' => $payslip->payment_method ? ucfirst(str_replace('_', ' ', $payslip->payment_method)) : null,
            'Paid On' => $payslip->paid_at?->format('M j, Y'),
        ]);

        $sections = '<div class="doc-section"><div class="doc-section-title">Employee</div>' . $details . '</div>';

        $allowances = $payslip->allowances_breakdown ?? [];
        if ($allowances) {
            $rows = [];
            foreach ($allowances as $label => $amount) {
                $rows[] = [ucfirst((string) $label), $money($amount)];
            }
            $sections .= '<div class="doc-section"><div class="doc-section-title">Allowances</div>'
                . $this->pdf->table(['Item', 'Amount'], $rows) . '</div>';
        }

        $deductions = $payslip->deductions_breakdown ?? [];
        if ($deductions) {
            $rows = [];
            foreach ($deductions as $label => $amount) {
                $rows[] = [ucfirst((string) $label), $money($amount)];
            }
            $sections .= '<div class="doc-section"><div class="doc-section-title">Deductions</div>'
                . $this->pdf->table(['Item', 'Amount'], $rows) . '</div>';
        }

        $totals = '<div class="doc-box" style="max-width: 320px; margin-left: auto;">'
            . '<table class="doc-dl">'
            . '<tr><td>Gross Pay</td><td class="text-right">' . $money($payslip->gross_amount) . '</td></tr>'
            . '<tr><td>Deductions</td><td class="text-right">' . $money($payslip->deductions_amount) . '</td></tr>'
            . '<tr class="doc-total"><td>Net Pay</td><td class="text-right">' . $money($payslip->net_amount) . '</td></tr>'
            . '</table></div>';

        return $this->pdf->download(
            'Payslip',
            $sections . $totals,
            'payslip-' . ($employee?->employee_id ?? $payslip->id) . '-' . ($payroll?->month ?? '') . '.pdf',
            ['document_no' => $payroll?->payroll_no]
        );
    }
}
