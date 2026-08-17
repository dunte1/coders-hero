<?php

namespace App\Http\Controllers\Api\Hr;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hr\MarkPayrollPaidRequest;
use App\Http\Requests\Hr\RunPayrollRequest;
use App\Http\Resources\Hr\PayrollResource;
use App\Http\Resources\Hr\PayslipResource;
use App\Services\Hr\HrService;
use App\Services\Hr\PayrollService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    use ApiResponse;

    public function __construct(
        private PayrollService $payrollService,
        private HrService $hrService
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

        $payslip = \App\Models\Payslip::where('id', $id)->where('employee_id', $employee->id)->first();

        if (!$payslip) {
            return $this->notFoundResponse('Payslip not found.');
        }

        return $this->successResponse(
            new PayslipResource($payslip->load(['employee.user', 'employee.department', 'employee.position', 'payroll'])),
            'Payslip retrieved successfully.'
        );
    }
}
