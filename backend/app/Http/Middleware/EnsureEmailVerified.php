<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailVerified
{
    public function handle(Request $request, Closure $next, string ...$exempt): Response
    {
        $user = $request->user();

        if ($user && $user->email_verified_at === null) {
            $routeName = $request->route()?->getName();

            if (! in_array($routeName, $exempt, true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email not verified.',
                    'code' => 'email_not_verified',
                ], 403);
            }
        }

        return $next($request);
    }
}
