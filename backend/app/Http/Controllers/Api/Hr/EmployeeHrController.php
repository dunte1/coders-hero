<?php

namespace App\Http\Controllers\Api\Hr;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hr\UpdateEmployeeHrRequest;
use App\Http\Resources\Hr\EmployeeHrResource;
use App\Models\Employee;
use App\Services\EmployeeService;
use App\Traits\ApiResponse;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\StreamedResponse;

class EmployeeHrController extends Controller
{
    use ApiResponse;

    public function __construct(
        private EmployeeService $employeeService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 15);
        $search = $request->get('search');

        $employees = $search
            ? $this->employeeService->search($search, $perPage)
            : $this->employeeService->getAll($perPage);

        $employees->getCollection()->loadMissing([
            'user', 'department', 'position', 'contracts',
            'leaveRequests', 'payslips', 'documents',
        ]);

        $paginated = new \Illuminate\Pagination\LengthAwarePaginator(
            EmployeeHrResource::collection($employees->getCollection())->resolve(),
            $employees->total(),
            $employees->perPage(),
            $employees->currentPage(),
            ['path' => $employees->path(), 'query' => request()->query()]
        );

        return $this->paginatedResponse($paginated, 'Employees retrieved successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $employee = $this->employeeService->getById($id);

        if (!$employee) {
            return $this->notFoundResponse('Employee not found.');
        }

        $employee->loadMissing(['user', 'department', 'position', 'contracts', 'documents']);

        return $this->successResponse(
            new EmployeeHrResource($employee),
            'Employee retrieved successfully.'
        );
    }

    public function idCardPdf(int $id): StreamedResponse
    {
        $employee = Employee::with(['user', 'department', 'position'])->find($id);

        if (!$employee) {
            abort(404, 'Employee not found.');
        }

        $qrSvg = '';
        if ($employee->qr_code) {
            $renderer = new ImageRenderer(
                new RendererStyle(200, 3),
                new SvgImageBackEnd()
            );
            $qrSvg = (new Writer($renderer))->writeString($employee->qr_code);
        }

        $photo = $employee->photo_url;
        $fullName = $employee->full_name;
        $initials = strtoupper(substr($fullName, 0, 1));
        $parts = explode(' ', $fullName);
        if (count($parts) > 1) {
            $initials .= strtoupper(end($parts)[0] ?? '');
        }

        $photoHtml = $photo
            ? '<img src="' . e($photo) . '" style="width: 72px; height: 72px; border-radius: 8px; object-fit: cover;">'
            : '<div style="width: 72px; height: 72px; border-radius: 8px; background: ' . \App\Models\SiteSetting::sitePrimaryColor() . '22; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: bold; color: ' . \App\Models\SiteSetting::sitePrimaryColor() . ';">' . e($initials) . '</div>';

        $content = '
            <div class="doc-section">
                <div class="doc-section-title">Staff Identification Card</div>
                <div style="display: flex; align-items: center; gap: 14px;">'
                . $photoHtml
                . '<div><div style="font-size: 17px; font-weight: bold; color: #0f172a;">' . e($fullName) . '</div>'
                . '<div class="text-muted">' . e($employee->employee_id) . '</div></div></div>'
                . $this->pdf->detailsBox([
                    'Department' => $employee->department?->name ?? '—',
                    'Position' => $employee->position?->name ?? '—',
                    'Employment Type' => ucfirst(str_replace('_', ' ', $employee->employment_type)),
                    'Hire Date' => $employee->hire_date?->format('M j, Y') ?? '—',
                    'Status' => ucfirst($employee->status),
                ])
                . '</div>'
            . '<div class="doc-section">'
                . '<div class="doc-section-title">Verification</div>'
                . '<div style="display: flex; align-items: center; gap: 14px;">'
                . '<div style="width: 88px; height: 88px;">' . $qrSvg . '</div>'
                . '<p class="text-muted">Scan the QR code to verify this employee\'s identity.</p>'
                . '</div></div>';

        return $this->pdf->download(
            'Staff ID Card',
            $content,
            'id-card-' . $employee->employee_id . '.pdf',
            ['document_no' => $employee->employee_id]
        );
    }

    public function update(UpdateEmployeeHrRequest $request, int $id): JsonResponse
    {
        $employee = $this->employeeService->update($id, $request->validated());

        $employee->loadMissing(['user', 'department', 'position', 'contracts']);

        return $this->successResponse(
            new EmployeeHrResource($employee),
            'Employee updated successfully.'
        );
    }
}
