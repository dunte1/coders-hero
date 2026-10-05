<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Resources\PopupResource;
use App\Models\Popup;
use App\Services\Website\MediaService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PopupController extends Controller
{
    use ApiResponse;

    public function __construct(private MediaService $mediaService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Popup::query();

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->input('search') . '%');
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('active')) {
            $query->where('active', $request->boolean('active'));
        }

        $query->ordered();

        return $this->paginatedResponse(
            $query->paginate((int) $request->input('per_page', 20))->withQueryString()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:7000000'],
            'button_text' => ['nullable', 'string', 'max:255'],
            'button_url' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'in:advert,seasonal_greeting'],
            'animation_style' => ['nullable', 'string', 'in:fade,slide_up,bounce,zoom'],
            'overlay_style' => ['nullable', 'string', 'in:dark,light,blur,none'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'frequency' => ['required', 'in:every_visit,once_per_session,once_per_day,once_ever'],
            'active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $validated['image'] = $this->mediaService->store($validated['image'] ?? null);

        $popup = Popup::create($validated);

        return $this->createdResponse(
            new PopupResource($popup),
            'Popup created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $popup = Popup::find($id);

        if (!$popup) {
            return $this->notFoundResponse('Popup not found.');
        }

        return $this->successResponse(new PopupResource($popup), 'Popup retrieved successfully.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $popup = Popup::findOrFail($id);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:7000000'],
            'button_text' => ['nullable', 'string', 'max:255'],
            'button_url' => ['nullable', 'string', 'max:255'],
            'type' => ['sometimes', 'in:advert,seasonal_greeting'],
            'animation_style' => ['nullable', 'string', 'in:fade,slide_up,bounce,zoom'],
            'overlay_style' => ['nullable', 'string', 'in:dark,light,blur,none'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'frequency' => ['sometimes', 'in:every_visit,once_per_session,once_per_day,once_ever'],
            'active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if (array_key_exists('image', $validated)) {
            $validated['image'] = $this->mediaService->store($validated['image']);
        }

        $popup->update($validated);

        return $this->successResponse(
            new PopupResource($popup->fresh()),
            'Popup updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        Popup::findOrFail($id)->delete();

        return $this->noContentResponse('Popup deleted successfully.');
    }

    public function toggleActive(int $id): JsonResponse
    {
        $popup = Popup::findOrFail($id);
        $popup->update(['active' => !$popup->active]);

        return $this->successResponse(
            new PopupResource($popup->fresh()),
            'Popup status updated.'
        );
    }
}
