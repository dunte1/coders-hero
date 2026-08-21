<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (Auth::check() && $request->method() !== 'GET') {
            try {
                $data = [
                    'user_id' => Auth::id(),
                    'user_type' => get_class(Auth::user()),
                    'method' => $request->method(),
                    'path' => $request->path(),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'response_status' => $response->getStatusCode(),
                ];

                if ($request->isMethod('POST') || $request->isMethod('PUT') || $request->isMethod('PATCH')) {
                    $data['request_data'] = collect($request->except(['password', 'password_confirmation', 'current_password']))->toArray();
                }

                Log::channel('activity')->info('User activity', $data);
            } catch (\Exception $e) {
                Log::error('Failed to log activity: ' . $e->getMessage());
            }
        }

        return $response;
    }
}
