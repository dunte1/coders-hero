<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    use RefreshDatabase;

    public function test_web_routes_include_security_headers(): void
    {
        $response = $this->get('/');

        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    }

    public function test_security_headers_middleware_is_registered(): void
    {
        $middleware = $this->app->make('router')->getMiddleware();
        $this->assertArrayHasKey('security-headers', $middleware);
    }

    public function test_hsts_header_not_set_in_testing(): void
    {
        $response = $this->get('/');
        $response->assertHeaderMissing('Strict-Transport-Security');
    }
}
