<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Services\Website\ChatService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatSettingsController extends Controller
{
    use ApiResponse;

    public function __construct(private ChatService $chatService) {}

    public function show(): JsonResponse
    {
        $settings = $this->chatSettingsMap();

        return $this->successResponse([
            'settings' => $settings,
            'llm_configured' => $this->chatService->llmAvailable(),
            'model' => config('services.openai.model', 'gpt-4o-mini'),
            'enabled' => (bool) filter_var(config('services.openai.enabled', true), FILTER_VALIDATE_BOOL),
        ], 'Chat settings retrieved successfully.');
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => ['sometimes', 'array'],
            'settings.widget_title' => ['sometimes', 'string', 'max:255'],
            'settings.widget_subtitle' => ['sometimes', 'string', 'max:500'],
            'settings.welcome_message' => ['sometimes', 'string', 'max:1000'],
            'settings.primary_color' => ['sometimes', 'string', 'max:20'],
            'settings.enabled' => ['sometimes', 'boolean'],
            'enabled' => ['sometimes', 'boolean'],
        ]);

        $settings = $validated['settings'] ?? [];

        if (array_key_exists('enabled', $validated)) {
            $settings['enabled'] = $validated['enabled'] ? '1' : '0';
        }

        foreach ($settings as $key => $value) {
            SiteSetting::updateOrCreate(
                ['key' => 'chat.' . $key],
                [
                    'value' => is_bool($value) ? ($value ? '1' : '0') : (string) $value,
                    'group' => 'chat',
                ]
            );
        }

        return $this->successResponse(
            $this->chatSettingsMap(),
            'Chat settings updated successfully.'
        );
    }

    private function chatSettingsMap(): array
    {
        $settings = SiteSetting::query()->where('group', 'chat')->get();

        $result = [];
        foreach ($settings as $setting) {
            $key = str_replace('chat.', '', $setting->key);
            $result[$key] = $setting->value;
        }

        return $result;
    }
}
