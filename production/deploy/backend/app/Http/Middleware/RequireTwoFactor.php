<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireTwoFactor
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->two_factor_enabled && $user->two_factor_confirmed_at === null) {
            return response()->json([
                'success' => false,
                'message' => 'Two-factor authentication not confirmed.',
                'code' => 'two_factor_not_confirmed',
            ], 403);
        }

        return $next($request);
    }
}
