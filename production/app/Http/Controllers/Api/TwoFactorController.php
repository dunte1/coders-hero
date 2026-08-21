<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ConfirmTwoFactorRequest;
use App\Http\Requests\Auth\DisableTwoFactorRequest;
use App\Http\Requests\Auth\VerifyTwoFactorRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Services\TwoFactorService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class TwoFactorController extends Controller
{
    use ApiResponse;

    public function __construct(
        private AuthService $authService,
        private TwoFactorService $twoFactorService
    ) {}

    public function enable(Request $request): JsonResponse
    {
        $data = $this->twoFactorService->enable($request->user());

        return $this->successResponse($data, 'Two-factor authentication enabled. Enter a code to confirm.');
    }

    public function confirm(ConfirmTwoFactorRequest $request): JsonResponse
    {
        $this->twoFactorService->confirm($request->user(), $request->code);

        return $this->successResponse(null, 'Two-factor authentication confirmed successfully.');
    }

    public function disable(DisableTwoFactorRequest $request): JsonResponse
    {
        $this->twoFactorService->disable(
            $request->user(),
            $request->current_password,
            $request->code
        );

        return $this->successResponse(null, 'Two-factor authentication disabled successfully.');
    }

    public function challenge(VerifyTwoFactorRequest $request): JsonResponse
    {
        $accessToken = PersonalAccessToken::findToken((string) $request->bearerToken());

        if (! $accessToken || $accessToken->name !== 'two-factor-token' || ! $accessToken->can('two-factor-pending')) {
            return $this->errorResponse(
                'This endpoint requires a pending two-factor token. Please log in again.',
                403
            );
        }

        $user = $accessToken->tokenable;

        $result = $this->authService->loginWithTwoFactorCode($user, $request->code ?? $request->recovery_code);

        $accessToken->delete();

        return $this->successResponse([
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
            'requires_two_factor' => false,
        ], 'Two-factor authentication successful.');
    }

    public function recoveryCodes(Request $request): JsonResponse
    {
        $codes = $this->twoFactorService->regenerateRecoveryCodes($request->user());

        return $this->successResponse(['recovery_codes' => $codes], 'Recovery codes regenerated successfully.');
    }

    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->successResponse([
            'enabled' => (bool) $user->two_factor_enabled,
            'confirmed_at' => $user->two_factor_confirmed_at?->toISOString(),
        ], 'Two-factor authentication status retrieved.');
    }
}
