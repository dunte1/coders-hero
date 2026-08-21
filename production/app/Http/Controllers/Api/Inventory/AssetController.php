<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\AssignAssetRequest;
use App\Http\Requests\Inventory\StoreAssetRequest;
use App\Http\Requests\Inventory\UpdateAssetRequest;
use App\Http\Resources\Inventory\AssetAssignmentResource;
use App\Http\Resources\Inventory\AssetResource;
use App\Services\Inventory\AssetService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    use ApiResponse;

    public function __construct(
        private AssetService $assetService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $assets = $this->assetService->index(
            $request->only(['status', 'category_id', 'location_id', 'search']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            AssetResource::collection($assets),
            'Assets retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            $asset = $this->assetService->show($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Asset not found.');
        }

        return $this->successResponse(new AssetResource($asset));
    }

    public function store(StoreAssetRequest $request): JsonResponse
    {
        $asset = $this->assetService->store($request->validated());

        return $this->createdResponse(
            new AssetResource($asset->load(['category', 'location', 'assignments', 'roboticsEquipment'])),
            'Asset added to inventory.'
        );
    }

    public function update(UpdateAssetRequest $request, int $id): JsonResponse
    {
        try {
            $asset = $this->assetService->update($id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Asset not found.');
        }

        return $this->successResponse(new AssetResource($asset), 'Asset updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->assetService->destroy($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Asset not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->noContentResponse('Asset deleted.');
    }

    // Check-out
    public function assign(AssignAssetRequest $request, int $id): JsonResponse
    {
        try {
            $assignment = $this->assetService->checkOut($id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Asset not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->createdResponse(new AssetAssignmentResource($assignment), 'Asset checked out.');
    }

    // Check-in
    public function checkIn(Request $request, int $id): JsonResponse
    {
        $request->validate(['note' => ['nullable', 'string']]);

        try {
            $assignment = $this->assetService->checkIn($id, $request->input('note'));
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Asset not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse(new AssetAssignmentResource($assignment), 'Asset checked in.');
    }

    // Disposal
    public function dispose(Request $request, int $id): JsonResponse
    {
        $request->validate(['note' => ['nullable', 'string']]);

        try {
            $asset = $this->assetService->dispose($id, $request->input('note'));
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Asset not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse(new AssetResource($asset), 'Asset marked as disposed.');
    }

    // Assignment history for one asset
    public function assignments(Request $request, int $id): JsonResponse
    {
        $assignments = $this->assetService->assignments(
            ['asset_id' => $id, 'status' => $request->get('status')],
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            AssetAssignmentResource::collection($assignments),
            'Assignments retrieved successfully.'
        );
    }

    // QR scan by code
    public function scan(string $qrCode): JsonResponse
    {
        try {
            $asset = $this->assetService->scan($qrCode);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('No asset found for that QR code.');
        }

        $data = new AssetResource($asset);
        $data = $data->resolve();
        $data['qr_code_url'] = $this->assetService->generateQrDataUrl($asset->qr_code);

        return $this->successResponse($data);
    }

    // Regenerate QR code
    public function qrCode(int $id): JsonResponse
    {
        try {
            $asset = $this->assetService->regenerateQr($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Asset not found.');
        }

        return $this->successResponse([
            'id' => $asset->id,
            'name' => $asset->name,
            'asset_code' => $asset->asset_code,
            'qr_code' => $asset->qr_code,
            'qr_code_url' => $this->assetService->generateQrDataUrl($asset->qr_code),
        ], 'QR code regenerated.');
    }
}
