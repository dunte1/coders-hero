<?php

namespace App\Services;

use App\Models\User;
use BaconQrCode\Renderer\GDLibRenderer;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorService
{
    public const APP_NAME = "Coder's Hero ERP";

    public function __construct(
        private Google2FA $google2fa
    ) {}

    public function generateSecret(): array
    {
        $secret = $this->google2fa->generateSecretKey();

        return [
            'secret' => $secret,
            'qr_code_url' => $this->generateQRCodeDataUrl(
                $this->google2fa->getQRCodeUrl(self::APP_NAME, '', $secret)
            ),
        ];
    }

    public function enable(User $user): array
    {
        $secret = $this->google2fa->generateSecretKey();
        $recoveryCodes = $this->generateRecoveryCodes();

        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => $recoveryCodes,
            'two_factor_confirmed_at' => null,
            'two_factor_enabled' => false,
        ])->save();

        return array_merge($this->getQRCodeData($user, $secret), [
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    public function confirm(User $user, string $code): bool
    {
        if (! $this->verifyCode($user, $code)) {
            throw ValidationException::withMessages([
                'code' => ['The two-factor code is invalid.'],
            ]);
        }

        $user->forceFill([
            'two_factor_confirmed_at' => now(),
            'two_factor_enabled' => true,
        ])->save();

        return true;
    }

    public function disable(User $user, string $password, ?string $code = null): bool
    {
        if (! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        if ($code !== null && $code !== '' && ! $this->verifyCode($user, $code)) {
            throw ValidationException::withMessages([
                'code' => ['The two-factor code is invalid.'],
            ]);
        }

        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
            'two_factor_enabled' => false,
        ])->save();

        return true;
    }

    public function verifyCode(User $user, string $code): bool
    {
        if (blank($user->two_factor_secret)) {
            return false;
        }

        return $this->google2fa->verifyKey($user->two_factor_secret, $code, 4);
    }

    public function generateRecoveryCodes(): array
    {
        $codes = [];

        for ($i = 0; $i < 10; $i++) {
            $codes[] = $this->recoveryCodeSegment() . '-' . $this->recoveryCodeSegment() . '-' . $this->recoveryCodeSegment();
        }

        return $codes;
    }

    public function verifyRecoveryCode(User $user, string $code): bool
    {
        $codes = $user->getTwoFactorRecoveryCodes();

        if (empty($codes)) {
            return false;
        }

        $normalized = strtoupper($code);

        foreach ($codes as $index => $stored) {
            if (hash_equals(strtoupper($stored), $normalized)) {
                unset($codes[$index]);
                $user->setTwoFactorRecoveryCodes(array_values($codes));

                return true;
            }
        }

        return false;
    }

    public function regenerateRecoveryCodes(User $user): array
    {
        $codes = $this->generateRecoveryCodes();
        $user->setTwoFactorRecoveryCodes($codes);

        return $codes;
    }

    public function getQRCodeData(User $user, string $secret): array
    {
        $otpUrl = $this->google2fa->getQRCodeUrl(self::APP_NAME, $user->email, $secret);

        return [
            'qr_code_url' => $this->generateQRCodeDataUrl($otpUrl),
            'otp_url' => $otpUrl,
            'secret' => $secret,
        ];
    }

    private function recoveryCodeSegment(int $length = 4): string
    {
        return strtoupper(substr(bin2hex(random_bytes(2)), 0, $length));
    }

    private function generateQRCodeDataUrl(string $otpUrl): string
    {
        $writer = new Writer(new GDLibRenderer(200, 4, 'png', 9));
        $image = $writer->writeString($otpUrl);

        return 'data:image/png;base64,' . base64_encode($image);
    }
}
