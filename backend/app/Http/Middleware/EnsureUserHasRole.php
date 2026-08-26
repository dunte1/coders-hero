<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!$user->hasAnyRole($roles)) {
            \Log::warning('Role access denied', [
                'user_id' => $user->id,
                'required_roles' => $roles,
                'user_roles' => $user->getRoleNames()->toArray(),
                'path' => request()->path(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'You do not have the required role to access this resource.',
            ], 403);
        }

        return $next($request);
    }
}
