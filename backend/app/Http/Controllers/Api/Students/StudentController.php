<?php

namespace App\Http\Controllers\Api\Students;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Services\Pdf\DocumentPdfService;
use App\Services\Students\StudentService;
use App\Traits\ApiResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private StudentService $studentService,
        private DocumentPdfService $pdf
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Student::class);

        $students = $this->studentService->getAll(
            $request->only(['search', 'status', 'grade', 'branch', 'guardian_id']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse($students, 'Students retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Student::class);

        $validated = $request->validate([
            'guardian_id' => ['nullable', 'integer', 'exists:guardians,id'],
            'user_id' => ['nullable', 'string', 'exists:users,id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'gender' => ['nullable', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'photo' => ['nullable', 'string', 'max:4000'],
            'grade' => ['nullable', 'string', 'max:100'],
            'branch' => ['nullable', 'string', 'max:255'],
            'admission_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:pending,active,suspended,withdrawn,transferred,graduated'],
            'medical_notes' => ['nullable', 'string'],
        ]);

        $student = $this->studentService->create($validated);

        return $this->createdResponse($student, 'Student created successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $student = $this->studentService->getById($id);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('view', $student);

        return $this->successResponse($student, 'Student retrieved successfully.');
    }

    public function idCardPdf(int $id): StreamedResponse
    {
        $student = $this->studentService->getById($id);

        if (!$student) {
            abort(404, 'Student not found.');
        }

        $this->authorize('view', $student);

        return $this->generateIdCardPdf($student);
    }

    public function myIdCardPdf(Request $request): StreamedResponse
    {
        $student = $request->user()->student;

        if (!$student) {
            abort(404, 'No student record found for your account.');
        }

        return $this->generateIdCardPdf($student);
    }

    private function generateIdCardPdf(Student $student): StreamedResponse
    {
        $primaryColor = \App\Models\SiteSetting::sitePrimaryColor();
        $siteName = \App\Models\SiteSetting::siteName();
        $siteTagline = \App\Models\SiteSetting::siteTagline();
        $siteContact = \App\Models\SiteSetting::siteContact();
        $contactPhone = $siteContact['phone'] ?? '';
        $contactEmail = $siteContact['email'] ?? '';
        $contactAddress = $siteContact['address'] ?? '';
        $siteLogo = \App\Models\SiteSetting::siteLogo();

        if ($siteLogo && str_starts_with($siteLogo, '/')) {
            $siteLogo = url($siteLogo);
        }

        $qrHtml = '';
        if ($student->qr_code) {
            $builder = new \Endroid\QrCode\Builder\Builder(
                data: $student->qr_code,
                size: 160,
                margin: 0,
            );
            $qrBase64 = base64_encode($builder->build()->getString());
            $qrHtml = '<img src="data:image/png;base64,' . $qrBase64 . '" width="36" height="36" style="width:36px;height:36px;">';
        }

        $photo = $student->id_card_photo_url ?? $student->photo_url ?? $student->user?->avatar_url;
        $photoHtml = $photo
            ? '<img src="' . e($photo) . '" width="60" height="72" style="width:60px;height:72px;border:2px solid ' . e($primaryColor) . ';">'
            : '<table width="60" height="72" cellpadding="0" cellspacing="0" style="width:60px;height:72px;border:2px solid ' . e($primaryColor) . ';background:#e2e8f0;"><tr><td align="center" valign="middle" style="font-size:18px;font-weight:bold;color:#64748b;">' . e(strtoupper(substr($student->first_name ?? '', 0, 1) . substr($student->last_name ?? '', 0, 1))) . '</td></tr></table>';

        $logoHtml = $siteLogo ? '<img src="' . e($siteLogo) . '" width="32" height="32" style="width:32px;height:32px;">' : '';

        $contactParts = array_filter([$contactPhone, $contactEmail, $contactAddress]);
        $contactLine = implode(' &nbsp;&middot;&nbsp; ', array_map('e', $contactParts));

        $html = '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>@page { margin: 0; }</style></head>
<body style="margin:0;padding:0;font-family:DejaVu Sans,Arial,sans-serif;background:' . e($primaryColor) . ';">
<table width="100%" cellpadding="0" cellspacing="0" style="width:100%;height:153px;background:#fff;color:#0f172a;border-collapse:collapse;">
<!-- HEADER -->
<tr><td height="22" style="background:' . e($primaryColor) . ';padding:0 8px;color:#fff;" valign="middle">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="color:#fff;font-size:10px;font-weight:bold;text-align:center;" valign="middle">' . e($siteName) . '<br><span style="font-size:6px;opacity:0.9;font-weight:normal;letter-spacing:0.3px;">' . e($siteTagline) . '</span></td>
<td width="38" align="right" valign="middle" style="color:#fff;">' . $logoHtml . '</td>
</tr></table>
</td></tr>
<!-- BODY -->
<tr><td style="padding:6px 8px;" valign="top">
<table width="100%" height="111" cellpadding="0" cellspacing="0" style="height:111px;border-collapse:collapse;">
<tr>
<!-- PHOTO -->
<td width="66" valign="top" style="padding-right:6px;">' . $photoHtml . '<div style="background:' . e($primaryColor) . ';color:#fff;font-size:5.5px;font-weight:bold;padding:2px 3px;text-align:center;margin-top:2px;">STUDENT</div></td>
<!-- FIELDS -->
<td valign="middle" style="padding-right:6px;font-size:6px;line-height:1.4;" align="left">
<div style="border:1.5px solid ' . e($primaryColor) . ';padding:2px 5px;margin-bottom:6px;font-size:9px;font-weight:bold;color:' . e($primaryColor) . ';">' . e(strtoupper($student->full_name)) . '</div>
<table cellpadding="0" cellspacing="0" style="font-size:6.5px;line-height:1.6;border-collapse:collapse;table-layout:fixed;width:100%;">
<tr><td style="font-weight:bold;color:#64748b;width:55px;">STUDENT ID</td><td style="width:5px;color:' . e($primaryColor) . ';font-weight:bold;text-align:center;">:</td><td style="font-weight:bold;white-space:nowrap;">' . e($student->student_id) . '</td></tr>
<tr><td style="font-weight:bold;color:#64748b;">GRADE</td><td style="color:' . e($primaryColor) . ';font-weight:bold;text-align:center;">:</td><td style="white-space:nowrap;">' . e($student->grade ?? '—') . '</td></tr>
<tr><td style="font-weight:bold;color:#64748b;">BRANCH</td><td style="color:' . e($primaryColor) . ';font-weight:bold;text-align:center;">:</td><td style="white-space:nowrap;">' . e($student->branch ?? '—') . '</td></tr>
<tr><td style="font-weight:bold;color:#64748b;">STATUS</td><td style="color:' . e($primaryColor) . ';font-weight:bold;text-align:center;">:</td><td style="white-space:nowrap;">' . e(ucfirst($student->status)) . '</td></tr>
<tr><td style="font-weight:bold;color:#64748b;">VALID FROM</td><td style="color:' . e($primaryColor) . ';font-weight:bold;text-align:center;">:</td><td style="white-space:nowrap;">' . e($student->admission_date?->format('M Y') ?? '—') . '</td></tr>
</table>
</td>
<!-- QR + SIGNATURE (bottom-aligned) -->
<td width="52" valign="bottom" align="center" style="font-size:5px;padding-bottom:2px;">
<div style="border-top:0.5px solid #cbd5e1;padding-top:3px;margin-bottom:6px;color:#64748b;font-style:italic;">Principal</div>
<div>' . $qrHtml . '</div>
<div style="color:#94a3b8;font-size:3.5px;margin-top:2px;">Scan to verify</div>
</td>
</tr>
</table>
</td></tr>
<!-- FOOTER -->
<tr><td height="20" style="background:' . e($primaryColor) . ';padding:3px 8px;color:#fff;" valign="middle">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="color:#fff;font-size:6px;text-align:center;font-weight:bold;letter-spacing:0.2px;" valign="middle">' . $contactLine . '</td>
</tr></table>
</td></tr>
</table>
</body>
</html>';

        $pdf = Pdf::loadHTML($html);
        $pdf->getDomPDF()->getOptions()->set('isRemoteEnabled', true);
        $pdf->setPaper([0, 0, 242.64, 153], 'portrait');

        return response()->streamDownload(
            function () use ($pdf): void {
                echo $pdf->output();
            },
            'id-card-' . $student->student_id . '.pdf',
            ['Content-Type' => 'application/pdf']
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $student = $this->studentService->getById($id);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('update', $student);

        $validated = $request->validate([
            'guardian_id' => ['nullable', 'integer', 'exists:guardians,id'],
            'user_id' => ['nullable', 'string', 'exists:users,id'],
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'gender' => ['nullable', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'photo' => ['nullable', 'string', 'max:4000'],
            'grade' => ['nullable', 'string', 'max:100'],
            'branch' => ['nullable', 'string', 'max:255'],
            'admission_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:pending,active,suspended,withdrawn,transferred,graduated'],
            'medical_notes' => ['nullable', 'string'],
        ]);

        $student = $this->studentService->update($id, $validated);

        return $this->successResponse($student, 'Student updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $student = $this->studentService->getById($id);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('delete', $student);

        $this->studentService->delete($id);

        return $this->noContentResponse('Student deleted successfully.');
    }

    public function uploadPhoto(Request $request, int $id): JsonResponse
    {
        $student = $this->studentService->getById($id);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('uploadPhoto', $student);

        $validated = $request->validate([
            'photo' => ['required', 'image', 'max:5120'],
        ]);

        $photo = $request->file('photo');

        $student = $this->studentService->uploadPhoto($student, $photo);

        return $this->successResponse($student, 'Photo uploaded successfully.');
    }

    public function uploadIdCardPhoto(Request $request, int $id): JsonResponse
    {
        $student = $this->studentService->getById($id);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('update', $student);

        $request->validate([
            'photo' => ['required', 'image', 'max:2048'],
        ]);

        $file = $request->file('photo');
        $path = $file->store('id-card-photos', 'public');

        $student->update(['id_card_photo' => $path]);

        return $this->successResponse($student->fresh(), 'ID card photo uploaded successfully.');
    }

    public function promote(Request $request, int $id): JsonResponse
    {
        $student = $this->studentService->getById($id);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('promote', $student);

        $validated = $request->validate([
            'new_grade' => ['nullable', 'string', 'max:100'],
        ]);

        $student = $this->studentService->promote($student, $validated['new_grade'] ?? null);

        return $this->successResponse($student, 'Student promoted successfully.');
    }

    public function transfer(Request $request, int $id): JsonResponse
    {
        $student = $this->studentService->getById($id);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('transfer', $student);

        $validated = $request->validate([
            'branch' => ['required', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $student = $this->studentService->transfer($student, $validated['branch'], $validated['note'] ?? null);

        return $this->successResponse($student, 'Student transferred successfully.');
    }

    public function graduate(Request $request, int $id): JsonResponse
    {
        $student = $this->studentService->getById($id);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('graduate', $student);

        $validated = $request->validate([
            'graduation_date' => ['nullable', 'date'],
        ]);

        $student = $this->studentService->graduate($student, $validated['graduation_date'] ?? null);

        return $this->successResponse($student, 'Student graduated successfully.');
    }

    public function overview(): JsonResponse
    {
        $this->authorize('viewAny', Student::class);

        return $this->successResponse(
            $this->studentService->overview(),
            'Student overview retrieved successfully.'
        );
    }

    public function grades(): JsonResponse
    {
        $this->authorize('viewAny', Student::class);

        return $this->successResponse(
            $this->studentService->distinctGrades(),
            'Student grades retrieved successfully.'
        );
    }

    public function branches(): JsonResponse
    {
        $this->authorize('viewAny', Student::class);

        return $this->successResponse(
            $this->studentService->distinctBranches(),
            'Student branches retrieved successfully.'
        );
    }
}
