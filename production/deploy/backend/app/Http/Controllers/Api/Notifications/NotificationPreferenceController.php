<?php

namespace App\Http\Controllers\Api\Notifications;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notifications\StoreFcmTokenRequest;
use App\Http\Requests\Notifications\UpdateNotificationPreferencesRequest;
use App\Http\Resources\Notifications\NotificationPreferenceResource;
use App\Models\UserFcmToken;
use App\Services\Notifications\NotificationDispatcher;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    use ApiResponse;

    public function __construct(private NotificationDispatcher $dispatcher) {}

    public function index(): JsonResponse
    {
        $preferences = $this->dispatcher->preferencesFor(auth()->user());

        return $this->successResponse(
            NotificationPreferenceResource::collection(collect($preferences)->values()),
            'Notification preferences retrieved successfully.'
        );
    }

    public function update(UpdateNotificationPreferencesRequest $request): JsonResponse
    {
        $preferences = $this->dispatcher->updatePreferences(
            auth()->user(),
            $request->input('preferences')
        );

        return $this->successResponse(
            NotificationPreferenceResource::collection(collect($preferences)->values()),
            'Notification preferences updated successfully.'
        );
    }

    public function storeFcmToken(StoreFcmTokenRequest $request): JsonResponse
    {
        $user = auth()->user();

        $existing = UserFcmToken::where('user_id', $user->id)
            ->where('token', $request->input('token'))
            ->first();

        if ($existing) {
            $existing->update([
                'device_name' => $request->input('device_name'),
                'platform' => $request->input('platform'),
                'revoked_at' => null,
                'last_used_at' => now(),
            ]);

            return $this->successResponse(['id' => $existing->id], 'Push token updated successfully.');
        }

        $token = $user->fcmTokens()->create([
            'token' => $request->input('token'),
            'device_name' => $request->input('device_name'),
            'platform' => $request->input('platform'),
            'last_used_at' => now(),
        ]);

        return $this->createdResponse(['id' => $token->id], 'Push token registered successfully.');
    }

    public function destroyFcmToken(Request $request, int $id): JsonResponse
    {
        $token = UserFcmToken::where('user_id', auth()->id())->findOrFail($id);
        $token->revoke();

        return $this->noContentResponse('Push token revoked successfully.');
    }

    public function myTokens(): JsonResponse
    {
        $tokens = auth()->user()
            ->fcmTokens()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($token) => [
                'id' => $token->id,
                'device_name' => $token->device_name,
                'platform' => $token->platform,
                'is_active' => $token->isActive(),
                'last_used_at' => $token->last_used_at?->toISOString(),
                'created_at' => $token->created_at?->toISOString(),
            ]);

        return $this->successResponse($tokens, 'Push tokens retrieved successfully.');
    }
}
