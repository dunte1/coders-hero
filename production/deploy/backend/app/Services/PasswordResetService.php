<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\SendPasswordResetLink;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetService
{
    public function sendResetLink(array $credentials): string
    {
        return Password::broker()->sendResetLink(
            $credentials,
            function (User $user, string $token): void {
                $user->notify(new SendPasswordResetLink($token));
            }
        );
    }

    public function reset(array $credentials): string
    {
        $status = Password::broker()->reset(
            $credentials,
            function (User $user, string $password): void {
                $user->password = Hash::make($password);
                $user->remember_token = null;
                $user->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [trans($status)],
            ]);
        }

        return $status;
    }

    public function validateToken(string $token, string $email): bool
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            return false;
        }

        return Password::broker()->tokenExists($user, $token);
    }
}
