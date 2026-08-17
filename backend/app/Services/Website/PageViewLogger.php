<?php

namespace App\Services\Website;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageViewLogger
{
    public static function record(Request $request, string $path): void
    {
        \App\Models\PageView::create([
            'path' => $path,
            'referrer' => Str::limit($request->input('referrer'), 500),
            'user_agent' => Str::limit($request->userAgent(), 500),
            'ip_address' => $request->ip(),
            'visitor_id' => Str::limit($request->input('visitor_id'), 64),
            'is_mobile' => $request->input('is_mobile') === true || $request->input('is_mobile') === '1',
        ]);
    }
}
