<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $faqs = Faq::query()->ordered()->get();

        return $this->successResponse(
            FaqResource::collection($faqs),
            'FAQs retrieved successfully.'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string'],
            'category' => ['nullable', 'string', 'max:50'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $faq = Faq::create($validated);

        return $this->createdResponse(
            new FaqResource($faq),
            'FAQ created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $faq = Faq::find($id);

        if (!$faq) {
            return $this->notFoundResponse('FAQ not found.');
        }

        return $this->successResponse(new FaqResource($faq), 'FAQ retrieved successfully.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $faq = Faq::findOrFail($id);

        $validated = $request->validate([
            'question' => ['sometimes', 'string', 'max:500'],
            'answer' => ['sometimes', 'string'],
            'category' => ['nullable', 'string', 'max:50'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $faq->update($validated);

        return $this->successResponse(
            new FaqResource($faq->fresh()),
            'FAQ updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        Faq::findOrFail($id)->delete();

        return $this->noContentResponse('FAQ deleted successfully.');
    }

    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'faqs' => ['required', 'array'],
            'faqs.*.id' => ['required', 'integer'],
            'faqs.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['faqs'] as $item) {
            Faq::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return $this->successResponse(
            FaqResource::collection(Faq::query()->ordered()->get()),
            'FAQs reordered successfully.'
        );
    }
}
