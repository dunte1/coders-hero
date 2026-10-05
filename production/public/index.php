<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Serve maintenance page if enabled
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve static files that exist in public/
$filePath = __DIR__ . $requestUri;
if ($requestUri !== '/' && file_exists($filePath) && is_file($filePath)) {
    $mimeTypes = [
        'css'  => 'text/css',
        'js'   => 'application/javascript',
        'json' => 'application/json',
        'svg'  => 'image/svg+xml',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',
        'ico'  => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2'=> 'font/woff2',
        'ttf'  => 'font/ttf',
        'eot'  => 'application/vnd.ms-fontobject',
        'html' => 'text/html',
        'txt'  => 'text/plain',
    ];
    $ext = pathinfo($filePath, PATHINFO_EXTENSION);
    if (isset($mimeTypes[strtolower($ext)])) {
        header('Content-Type: ' . $mimeTypes[strtolower($ext)]);
    }
    readfile($filePath);
    exit;
}

// API & Sanctum routes → Laravel
if (str_starts_with($requestUri, '/api') || str_starts_with($requestUri, '/sanctum')) {
    (require_once __DIR__.'/../bootstrap/app.php')
        ->handleRequest(Request::capture());
    exit;
}

// Everything else → React SPA (index.html)
$indexHtml = __DIR__ . '/index.html';
if (file_exists($indexHtml)) {
    header('Content-Type: text/html');
    readfile($indexHtml);
    exit;
}

// Fallback: if no index.html, let Laravel handle it
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
