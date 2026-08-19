<?php

namespace App\Services;

use App\Models\LoginHistory;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class LoginHistoryService
{
    public function __construct(
        private LoginHistory $model
    ) {}

    public function record(?User $user, string $status, array $extra = []): void
    {
        if (! $user) {
            return;
        }

        $request = request();
        $userAgent = (string) $request->header('User-Agent', '');
        $ip = $request->ip() ?: $request->header('X-Forwarded-For');

        $this->model->create([
            'user_id' => $user->id,
            'ip_address' => Str::limit((string) $ip, 45),
            'user_agent' => Str::limit($userAgent, 255),
            'device_type' => $this->detectDeviceType($userAgent),
            'platform' => $this->detectPlatform($userAgent),
            'browser' => $this->detectBrowser($userAgent),
            'location' => $extra['location'] ?? null,
            'status' => $status,
            'attempted_at' => now(),
            'logged_in_at' => $status === 'success' ? now() : null,
            'logged_out_at' => $extra['logged_out_at'] ?? null,
        ]);
    }

    public function listFor(User $user, ?int $perPage = null): LengthAwarePaginator
    {
        return LoginHistory::forUser($user->id)
            ->with('user:id,name,email')
            ->latest('attempted_at')
            ->paginate($perPage ?? 15);
    }

    public function listAll(?int $perPage = null, ?string $search = null): LengthAwarePaginator
    {
        return LoginHistory::query()
            ->with('user:id,name,email')
            ->when($search, function ($query, string $search) {
                $query->whereHas('user', function ($query) use ($search) {
                    $query->where('email', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->latest('attempted_at')
            ->paginate($perPage ?? 15);
    }

    public function find(int $id): ?LoginHistory
    {
        return LoginHistory::with('user:id,name,email')->find($id);
    }

    public function clearFor(User $user): int
    {
        return LoginHistory::forUser($user->id)->delete();
    }

    public function getLatest(User $user): ?LoginHistory
    {
        return LoginHistory::forUser($user->id)
            ->latest('attempted_at')
            ->first();
    }

    private function detectDeviceType(string $userAgent): string
    {
        $userAgent = strtolower($userAgent);

        if (preg_match('/bot|crawler|spider|slurp|facebookexternalhit|curl/i', $userAgent)) {
            return 'bot';
        }

        if (preg_match('/tablet|ipad/i', $userAgent)) {
            return 'tablet';
        }

        if (preg_match('/mobile|iphone|android.*mobile|windows phone/i', $userAgent)) {
            return 'mobile';
        }

        return 'desktop';
    }

    private function detectPlatform(string $userAgent): string
    {
        $userAgent = strtolower($userAgent);

        if (preg_match('/windows nt|win32|win64/i', $userAgent)) {
            return 'Windows';
        }

        if (preg_match('/android/i', $userAgent)) {
            return 'Android';
        }

        if (preg_match('/iphone|ipad|ipod/i', $userAgent)) {
            return 'iOS';
        }

        if (preg_match('/mac os x|macintosh/i', $userAgent)) {
            return 'macOS';
        }

        if (preg_match('/linux/i', $userAgent)) {
            return 'Linux';
        }

        return 'Unknown';
    }

    private function detectBrowser(string $userAgent): string
    {
        $userAgent = strtolower($userAgent);

        if (preg_match('/edg\//i', $userAgent) || preg_match('/edge/i', $userAgent)) {
            return 'Edge';
        }

        if (preg_match('/opr\/|opera/i', $userAgent)) {
            return 'Opera';
        }

        if (preg_match('/firefox/i', $userAgent)) {
            return 'Firefox';
        }

        if (preg_match('/safari/i', $userAgent) && ! preg_match('/chrome/i', $userAgent)) {
            return 'Safari';
        }

        if (preg_match('/chrome/i', $userAgent)) {
            return 'Chrome';
        }

        return 'Other';
    }
}
