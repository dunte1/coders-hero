<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Certificate\StoreCertificateTemplateRequest;
use App\Http\Requests\Certificate\UpdateCertificateTemplateRequest;
use App\Http\Resources\CertificateTemplateResource;
use App\Services\CertificateService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CertificateTemplateController extends Controller
{
    use ApiResponse;

    public function __construct(
        private CertificateService $certificateService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $templates = $this->certificateService->templates(
            $request->only(['search']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            CertificateTemplateResource::collection($templates),
            'Templates retrieved successfully.'
        );
    }

    public function options(): JsonResponse
    {
        return $this->successResponse(
            CertificateTemplateResource::collection($this->certificateService->allTemplates()),
            'Templates retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            $template = $this->certificateService->showTemplate($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Template not found.');
        }

        return $this->successResponse(new CertificateTemplateResource($template));
    }

    public function store(StoreCertificateTemplateRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            $data['logo_path'] = $request->file('logo')->store('certificates/logos', 'public');
        }

        $template = $this->certificateService->storeTemplate($data);

        return $this->createdResponse(new CertificateTemplateResource($template), 'Template created.');
    }

    public function update(UpdateCertificateTemplateRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            $template = $this->certificateService->showTemplate($id);
            if ($template->logo_path) {
                Storage::disk('public')->delete($template->logo_path);
            }
            $data['logo_path'] = $request->file('logo')->store('certificates/logos', 'public');
        }

        try {
            $template = $this->certificateService->updateTemplate($id, $data);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Template not found.');
        }

        return $this->successResponse(new CertificateTemplateResource($template), 'Template updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->certificateService->destroyTemplate($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Template not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->noContentResponse('Template deleted.');
    }
}
