<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Certificate\IssueCertificateRequest;
use App\Http\Requests\Certificate\RevokeCertificateRequest;
use App\Http\Requests\Certificate\VerifyCertificateRequest;
use App\Http\Resources\CertificateResource;
use App\Http\Resources\CertificateVerificationResource;
use App\Models\Certificate;
use App\Services\CertificateService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    use ApiResponse;

    public function __construct(
        private CertificateService $certificateService
    ) {}

    public function summary(): JsonResponse
    {
        return $this->successResponse(
            $this->certificateService->summary(),
            'Certificate summary retrieved successfully.'
        );
    }

    public function index(Request $request): JsonResponse
    {
        $certificates = $this->certificateService->myCertificates(auth()->id(), (int) $request->get('per_page', 15));

        return $this->paginatedResponse(
            CertificateResource::collection($certificates),
            'Certificates retrieved successfully.'
        );
    }

    public function all(Request $request): JsonResponse
    {
        $certificates = $this->certificateService->index(
            $request->only(['status', 'course_id', 'search']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            CertificateResource::collection($certificates),
            'Certificates retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $certificate = Certificate::with(['user', 'course', 'course.category', 'enrollment', 'template'])
            ->find($id);

        if (! $certificate) {
            return $this->notFoundResponse('Certificate not found.');
        }

        return $this->successResponse(
            new CertificateResource($certificate),
            'Certificate retrieved successfully.'
        );
    }

    public function verify(VerifyCertificateRequest $request): JsonResponse
    {
        try {
            $result = $this->certificateService->verify(
                $request->verification_code,
                $request->ip(),
                $request->userAgent()
            );
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 404);
        }

        return $this->successResponse($result, 'Certificate verified successfully.');
    }

    public function qrCode(string $verificationCode): JsonResponse
    {
        $certificate = Certificate::where('verification_code', $verificationCode)->first();

        if (! $certificate) {
            return $this->notFoundResponse('Certificate not found.');
        }

        return $this->successResponse([
            'id' => $certificate->id,
            'certificate_number' => $certificate->certificate_number,
            'qr_code_url' => $this->certificateService->generateQrDataUrl($verificationCode),
        ], 'QR code generated.');
    }

    public function issue(IssueCertificateRequest $request, int $enrollmentId): JsonResponse
    {
        try {
            $certificate = $this->certificateService->issue(
                $enrollmentId,
                $request->input('template_id'),
                auth()->id()
            );
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Enrollment not found.');
        }

        return $this->createdResponse(
            new CertificateResource($certificate->load(['user', 'course', 'template'])),
            'Certificate issued.'
        );
    }

    public function bulkGenerate(Request $request): JsonResponse
    {
        $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'template_id' => ['nullable', 'integer', 'exists:certificate_templates,id'],
        ]);

        $result = $this->certificateService->bulkGenerate(
            (int) $request->input('course_id'),
            $request->input('template_id') ? (int) $request->input('template_id') : null
        );

        return $this->successResponse($result, 'Bulk certificate generation completed.');
    }

    public function revoke(RevokeCertificateRequest $request, int $id): JsonResponse
    {
        try {
            $certificate = $this->certificateService->revoke($id, $request->input('reason'));
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Certificate not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse(
            new CertificateResource($certificate->load(['user', 'course', 'template'])),
            'Certificate revoked.'
        );
    }

    public function unrevoke(int $id): JsonResponse
    {
        try {
            $certificate = $this->certificateService->unrevoke($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Certificate not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse(
            new CertificateResource($certificate->load(['user', 'course', 'template'])),
            'Certificate reinstated.'
        );
    }

    public function verifications(Request $request): JsonResponse
    {
        $verifications = $this->certificateService->verifications(
            $request->only(['outcome']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            CertificateVerificationResource::collection($verifications),
            'Verifications retrieved successfully.'
        );
    }

    public function download(string $certificateNumber)
    {
        try {
            return $this->certificateService->downloadStream($certificateNumber);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Certificate not found.');
        }
    }
}
