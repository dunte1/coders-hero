<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\ResetTokenRequest;
use App\Services\PasswordResetService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class PasswordResetController extends Controller
{
    use ApiResponse;

    public function __construct(
        private PasswordResetService $passwordResetService
    ) {}

    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        $this->passwordResetService->sendResetLink($request->only('email'));

        return $this->successResponse(
            null,
            'If that email exists, a password reset link has been sent.'
        );
    }

    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $this->passwordResetService->reset($request->validated());

        return $this->successResponse(null, 'Password reset successfully. You can now log in with your new password.');
    }

    public function validateResetToken(ResetTokenRequest $request): JsonResponse
    {
        $valid = $this->passwordResetService->validateToken($request->token, $request->email);

        return $this->successResponse(['valid' => $valid], 'Token validation result.');
    }
}
