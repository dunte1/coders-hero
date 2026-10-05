<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CodingLanguage;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CodingLanguageController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $languages = CodingLanguage::ordered()->get();

        return $this->successResponse(
            $languages,
            'Coding languages retrieved successfully.'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:coding_languages,slug'],
            'icon' => ['nullable', 'string', 'max:255'],
            'piston_language' => ['required', 'string', 'max:255'],
            'entry_file' => ['required', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $language = CodingLanguage::create($validated);

        return $this->createdResponse(
            $language,
            'Coding language created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $language = CodingLanguage::find($id);

        if (!$language) {
            return $this->notFoundResponse('Coding language not found.');
        }

        return $this->successResponse(
            $language,
            'Coding language retrieved successfully.'
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $language = CodingLanguage::find($id);

        if (!$language) {
            return $this->notFoundResponse('Coding language not found.');
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:coding_languages,slug,' . $id],
            'icon' => ['nullable', 'string', 'max:255'],
            'piston_language' => ['sometimes', 'string', 'max:255'],
            'entry_file' => ['sometimes', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if (isset($validated['name']) && empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $language->update($validated);

        return $this->successResponse(
            $language->fresh(),
            'Coding language updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $language = CodingLanguage::find($id);

        if (!$language) {
            return $this->notFoundResponse('Coding language not found.');
        }

        $language->delete();

        return $this->noContentResponse('Coding language deleted successfully.');
    }

    public function publicIndex(): JsonResponse
    {
        $languages = CodingLanguage::active()->ordered()->get();

        return $this->successResponse(
            $languages,
            'Active coding languages retrieved successfully.'
        );
    }
}
