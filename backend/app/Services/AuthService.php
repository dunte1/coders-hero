<?php

namespace App\Services;

use App\Jobs\SendWelcomeEmailJob;
use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private EmailVerificationService $emailVerificationService,
        private LoginHistoryService $loginHistoryService,
        private TwoFactorService $twoFactorService
    ) {}

    public function register(array $data): array
    {
        $user = $this->userRepository->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
        ]);

        $user->assignRole('student');

        $token = $user->createToken('auth-token')->plainTextToken;

        if (class_exists(SendWelcomeEmailJob::class)) {
            SendWelcomeEmailJob::dispatch($user);
        }

        $this->emailVerificationService->sendVerificationLink($user);

        return [
            'user' => $user->load('roles'),
            'token' => $token,
            'requires_email_verification' => true,
        ];
    }

    public function login(array $data): array
    {
        $user = $this->userRepository->findByEmail($data['email']);

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            $this->loginHistoryService->record($user, 'failed', ['reason' => 'invalid_credentials']);

            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            $this->loginHistoryService->record($user, 'failed', ['reason' => 'deactivated']);

            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated.'],
            ]);
        }

        if ($user->isTwoFactorEnabled()) {
            $token = $user->createToken('two-factor-token', ['two-factor-pending']);

            return [
                'user' => $user->load('roles'),
                'token' => $token->plainTextToken,
                'requires_two_factor' => true,
            ];
        }

        $this->userRepository->updateLastLogin($user->id);

        $tokenName = ($data['remember'] ?? false) ? 'remember-token' : 'auth-token';
        $token = $user->createToken($tokenName);

        if ($data['remember'] ?? false) {
            $token->accessToken->expires_at = now()->addDays(30);
            $token->accessToken->save();
        }

        $this->loginHistoryService->record($user, 'success');

        return [
            'user' => $user->load('roles'),
            'token' => $token->plainTextToken,
            'requires_two_factor' => false,
        ];
    }

    public function loginWithTwoFactorCode(User $user, string $code): array
    {
        $validCode = $this->twoFactorService->verifyCode($user, $code);

        if (! $validCode) {
            $validCode = $this->twoFactorService->verifyRecoveryCode($user, $code);
        }

        if (! $validCode) {
            $this->loginHistoryService->record($user, 'failed', ['reason' => 'invalid_two_factor_code']);

            throw ValidationException::withMessages([
                'code' => ['The two-factor code is invalid.'],
            ]);
        }

        $this->userRepository->updateLastLogin($user->id);
        $this->loginHistoryService->record($user, 'success');

        $token = $user->createToken('auth-token');

        return [
            'user' => $user->load('roles'),
            'token' => $token->plainTextToken,
            'requires_two_factor' => false,
        ];
    }

    public function logout(): bool
    {
        return Auth::user()->currentAccessToken()->delete();
    }

    public function refreshToken(): string
    {
        $user = Auth::user();
        $user->currentAccessToken()->delete();

        return $user->createToken('auth-token')->plainTextToken;
    }

    public function getProfile(): User
    {
        return Auth::user()->load('roles', 'employee', 'employee.department', 'employee.position');
    }

    public function updateProfile(array $data): User
    {
        $user = Auth::user();
        $user->update($data);

        return $user->fresh()->load('roles');
    }

    public function updateProfilePhoto(User $user, UploadedFile $photo): User
    {
        $extension = $photo->getClientOriginalExtension() ?: $photo->extension();
        $filename = $user->id . '-' . Str::random(20) . '.' . $extension;

        $path = $photo->storeAs('avatars', $filename, 'public');

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->update(['avatar' => $path]);

        return $user->fresh()->load('roles');
    }

    public function changePassword(array $data): bool
    {
        $user = Auth::user();

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update(['password' => Hash::make($data['password'])]);

        return true;
    }
}
