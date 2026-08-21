<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Support\Facades\URL;

class EmailVerificationService
{
    public function sendVerificationLink(User $user): bool
    {
        if ($user->hasVerifiedEmail()) {
            return false;
        }

        $user->notify(new VerifyEmailNotification($this->verificationUrl($user)));

        return true;
    }

    public function verificationUrl(User $user): string
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $user->getKey(),
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );
    }

    public function verify(User $user, string $hash): bool
    {
        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return false;
        }

        if ($user->hasVerifiedEmail()) {
            return true;
        }

        $user->markEmailAsVerified();

        return true;
    }

    public function resend(User $user): bool
    {
        return $this->sendVerificationLink($user);
    }
}
