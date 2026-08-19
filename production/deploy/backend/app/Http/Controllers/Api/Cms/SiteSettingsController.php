<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteSettingsController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $settings = SiteSetting::query()->orderBy('group')->orderBy('sort_order')->get();

        return $this->successResponse([
            'settings' => $settings,
            'groups' => SiteSetting::query()
                ->select('group')
                ->distinct()
                ->orderBy('group')
                ->pluck('group'),
        ], 'Site settings retrieved successfully.');
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string', 'max:255'],
            'settings.*.value' => ['nullable', 'string', 'max:5000'],
            'settings.*.group' => ['sometimes', 'string', 'max:50'],
            'settings.*.is_public' => ['sometimes', 'boolean'],
        ]);

        foreach ($validated['settings'] as $setting) {
            $values = [
                'value' => $setting['value'] ?? '',
                'group' => $setting['group'] ?? 'general',
                'is_public' => isset($setting['is_public']) ? (bool) $setting['is_public'] : true,
            ];

            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                $values
            );
        }

        $settings = SiteSetting::query()->orderBy('group')->orderBy('sort_order')->get();

        return $this->successResponse($settings, 'Site settings updated successfully.');
    }
}
