<?php

use App\Http\Controllers\Api\SitemapController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

// Serve React Frontend for all non-API routes
Route::get('/{any?}', function ($any = null) {
    // Don't serve frontend for API routes
    if ($any && (str_starts_with($any, 'api/') || $any === 'api')) {
        return response()->json(['error' => 'Not Found'], 404);
    }

    // Try multiple possible locations for React build
    $possiblePaths = [
        public_path('build/index.html'),
        base_path('public/build/index.html'),
        base_path('build/index.html'),
    ];

    foreach ($possiblePaths as $indexPath) {
        if (File::exists($indexPath)) {
            return response()->file($indexPath);
        }
    }

    // Fallback to API health check
    return response()->json([
        'name' => "Coder's Hero ERP & LMS",
        'version' => '1.0.0',
        'status' => 'running',
        'build_path' => $possiblePaths[0],
        'build_exists' => File::exists($possiblePaths[0]),
    ]);
})->where('any', '.*');

// Sitemap & Robots
Route::get('/sitemap.xml', [SitemapController::class, 'sitemap']);
Route::get('/robots.txt', [SitemapController::class, 'robots']);
