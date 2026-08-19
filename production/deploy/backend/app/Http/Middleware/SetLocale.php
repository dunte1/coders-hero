<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('Accept-Language');

        if (!$locale) {
            $locale = Auth::check() && Auth::user()->locale ? Auth::user()->locale : config('app.locale');
        }

        $locale = $this->resolveLocale($locale);

        App::setLocale($locale);

        return $next($request);
    }

    private function resolveLocale(string $locale): string
    {
        $supportedLocales = config('app.supported_locales', ['en']);

        $locale = strtolower(explode(',', $locale)[0]);
        $locale = explode('-', $locale)[0];
        $locale = explode('_', $locale)[0];

        if (in_array($locale, $supportedLocales)) {
            return $locale;
        }

        return config('app.fallback_locale', 'en');
    }
}
