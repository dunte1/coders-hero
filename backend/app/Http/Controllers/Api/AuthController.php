<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdateProfilePhotoRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        private AuthService $authService
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return $this->createdResponse([
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
            'requires_email_verification' => $result['requires_email_verification'],
        ], 'Registration successful.');
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        return $this->successResponse([
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
            'requires_two_factor' => $result['requires_two_factor'],
        ], 'Login successful.');
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout();

        return $this->noContentResponse('Logged out successfully.');
    }

    public function profile(Request $request): JsonResponse
    {
        $user = $this->authService->getProfile();

        return $this->successResponse(
            new UserResource($user),
            'Profile retrieved successfully.'
        );
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'avatar' => ['nullable', 'string', 'max:255'],
        ]);

        $user = $this->authService->updateProfile($validated);

        return $this->successResponse(
            new UserResource($user),
            'Profile updated successfully.'
        );
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->authService->changePassword($request->validated());

        return $this->successResponse(null, 'Password changed successfully.');
    }

    public function uploadPhoto(UpdateProfilePhotoRequest $request): JsonResponse
    {
        $user = $this->authService->updateProfilePhoto($request->user(), $request->file('photo'));

        return $this->successResponse(
            new UserResource($user),
            'Profile photo updated successfully.'
        );
    }

    public function refreshToken(Request $request): JsonResponse
    {
        $token = $this->authService->refreshToken();

        return $this->successResponse(['token' => $token], 'Token refreshed successfully.');
    }
}
