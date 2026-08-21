<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\EmailVerificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class EmailVerificationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private EmailVerificationService $emailVerificationService
    ) {}

    public function send(Request $request): JsonResponse
    {
        $sent = $this->emailVerificationService->sendVerificationLink($request->user());

        return $this->successResponse(
            null,
            $sent ? 'Verification link sent successfully.' : 'Email is already verified.'
        );
    }

    public function resend(Request $request): JsonResponse
    {
        return $this->send($request);
    }

    public function verify(Request $request, string $id, string $hash): JsonResponse
    {
        if (! $request->hasValidSignature()) {
            throw ValidationException::withMessages([
                'link' => ['Invalid or expired verification link.'],
            ]);
        }

        $user = User::findOrFail($id);

        if ($user->hasVerifiedEmail()) {
            return $this->successResponse(null, 'Email already verified.');
        }

        if (! $this->emailVerificationService->verify($user, $hash)) {
            throw ValidationException::withMessages([
                'link' => ['Invalid verification link.'],
            ]);
        }

        return $this->successResponse(null, 'Email verified successfully.');
    }
}
