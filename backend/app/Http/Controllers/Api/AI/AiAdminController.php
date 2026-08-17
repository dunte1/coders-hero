<?php

namespace App\Http\Controllers\Api\AI;

use App\Http\Controllers\Controller;
use App\Models\AiAssistant;
use App\Models\AiPromptTemplate;
use App\Services\AI\AiPlatformService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AiAdminController extends Controller
{
    use ApiResponse;

    public function __construct(
        private AiPlatformService $aiPlatformService
    ) {}

    // ---- Assistants ----

    public function assistantsIndex(Request $request): JsonResponse
    {
        $assistants = AiAssistant::query()
            ->withCount('conversations')
            ->when($request->input('search'), fn ($q, $term) => $q->where('name', 'like', "%{$term}%"))
            ->orderBy('name')
            ->paginate((int) $request->get('per_page', 20))
            ->withQueryString();

        return $this->paginatedResponse($assistants, 'Assistants retrieved successfully.');
    }

    public function assistantsStore(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120', 'unique:ai_assistants,slug'],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'string', 'max:40'],
            'icon' => ['nullable', 'string', 'max:40'],
            'system_prompt' => ['nullable', 'string'],
            'model' => ['nullable', 'string', 'max:100'],
            'max_tokens' => ['nullable', 'integer', 'min:1', 'max:16000'],
            'temperature' => ['nullable', 'numeric', 'min:0', 'max:2'],
            'is_active' => ['boolean'],
        ]);

        $assistant = AiAssistant::create([
            'name' => $request->input('name'),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')) . '-' . Str::lower(Str::random(4)),
            'description' => $request->input('description'),
            'category' => $request->input('category'),
            'icon' => $request->input('icon') ?? 'Sparkles',
            'system_prompt' => $request->input('system_prompt'),
            'model' => $request->input('model'),
            'max_tokens' => $request->input('max_tokens'),
            'temperature' => $request->input('temperature'),
            'is_active' => $request->boolean('is_active', true),
            'created_by_user_id' => auth()->id(),
        ]);

        return $this->createdResponse($assistant, 'Assistant created successfully.');
    }

    public function assistantsUpdate(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'slug' => ['sometimes', 'string', 'max:120', 'unique:ai_assistants,slug,' . $id],
            'description' => ['nullable', 'string'],
            'category' => ['sometimes', 'string', 'max:40'],
            'icon' => ['nullable', 'string', 'max:40'],
            'system_prompt' => ['nullable', 'string'],
            'model' => ['nullable', 'string', 'max:100'],
            'max_tokens' => ['nullable', 'integer', 'min:1', 'max:16000'],
            'temperature' => ['nullable', 'numeric', 'min:0', 'max:2'],
            'is_active' => ['boolean'],
        ]);

        $assistant = AiAssistant::findOrFail($id);
        $assistant->update($request->only([
            'name', 'slug', 'description', 'category', 'icon',
            'system_prompt', 'model', 'max_tokens', 'temperature', 'is_active',
        ]));

        return $this->successResponse($assistant->fresh(), 'Assistant updated successfully.');
    }

    public function assistantsDestroy(int $id): JsonResponse
    {
        try {
            $assistant = AiAssistant::findOrFail($id);
            $assistant->delete();
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Assistant not found.');
        }

        return $this->successResponse(null, 'Assistant deleted successfully.');
    }

    // ---- Prompt templates ----

    public function templatesIndex(Request $request): JsonResponse
    {
        $templates = AiPromptTemplate::query()
            ->when($request->input('category'), fn ($q, $c) => $q->where('category', $c))
            ->when($request->input('search'), fn ($q, $term) => $q->where('name', 'like', "%{$term}%"))
            ->orderBy('name')
            ->paginate((int) $request->get('per_page', 20))
            ->withQueryString();

        return $this->paginatedResponse($templates, 'Prompt templates retrieved successfully.');
    }

    public function templatesStore(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120', 'unique:ai_prompt_templates,slug'],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'string', 'max:40'],
            'template' => ['required', 'string'],
            'variables' => ['nullable', 'array'],
            'is_active' => ['boolean'],
        ]);

        $template = AiPromptTemplate::create([
            'name' => $request->input('name'),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')) . '-' . Str::lower(Str::random(4)),
            'description' => $request->input('description'),
            'category' => $request->input('category'),
            'template' => $request->input('template'),
            'variables' => $request->input('variables'),
            'is_active' => $request->boolean('is_active', true),
            'created_by_user_id' => auth()->id(),
        ]);

        return $this->createdResponse($template, 'Prompt template created successfully.');
    }

    public function templatesUpdate(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'slug' => ['sometimes', 'string', 'max:120', 'unique:ai_prompt_templates,slug,' . $id],
            'description' => ['nullable', 'string'],
            'category' => ['sometimes', 'string', 'max:40'],
            'template' => ['sometimes', 'string'],
            'variables' => ['nullable', 'array'],
            'is_active' => ['boolean'],
        ]);

        $template = AiPromptTemplate::findOrFail($id);
        $template->update($request->only([
            'name', 'slug', 'description', 'category', 'template', 'variables', 'is_active',
        ]));

        return $this->successResponse($template->fresh(), 'Prompt template updated successfully.');
    }

    public function templatesDestroy(int $id): JsonResponse
    {
        try {
            AiPromptTemplate::findOrFail($id)->delete();
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Prompt template not found.');
        }

        return $this->successResponse(null, 'Prompt template deleted successfully.');
    }

    // ---- Usage ----

    public function usage(Request $request): JsonResponse
    {
        $result = $this->aiPlatformService->adminUsage(
            $request->only(['assistant_id', 'from', 'to']),
            (int) $request->get('per_page', 20)
        );

        return $this->successResponse([
            'summary' => $result['summary'],
            'logs' => $result['logs']->items(),
            'meta' => [
                'current_page' => $result['logs']->currentPage(),
                'last_page' => $result['logs']->lastPage(),
                'per_page' => $result['logs']->perPage(),
                'total' => $result['logs']->total(),
            ],
        ], 'AI usage retrieved successfully.');
    }
}
