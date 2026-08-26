<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\Session\Exception\TokenMismatchException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            if (config('services.sentry.dsn')) {
                \Sentry\captureException($e);
            }
        });
    }

    public function render($request, Throwable $e)
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return $this->handleApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    private function handleApiException($request, Throwable $e)
    {
        if ($e instanceof ValidationException) {
            return $this->errorResponse(
                'Validation failed.',
                422,
                $e->errors(),
                $e
            );
        }

        if ($e instanceof ModelNotFoundException) {
            $model = class_basename($e->getModel());
            return $this->errorResponse(
                "{$model} not found.",
                404,
                null,
                $e
            );
        }

        if ($e instanceof AuthenticationException) {
            return $this->errorResponse(
                'Unauthenticated. Please log in.',
                401,
                null,
                $e
            );
        }

        if ($e instanceof AuthorizationException) {
            return $this->errorResponse(
                'Unauthorized. You do not have permission to perform this action.',
                403,
                null,
                $e
            );
        }

        if ($e instanceof NotFoundHttpException) {
            return $this->errorResponse(
                'Endpoint not found.',
                404,
                null,
                $e
            );
        }

        if ($e instanceof MethodNotAllowedHttpException) {
            return $this->errorResponse(
                'Method not allowed.',
                405,
                null,
                $e
            );
        }

        if ($e instanceof TooManyRequestsHttpException) {
            return $this->errorResponse(
                'Too many requests. Please try again later.',
                429,
                null,
                $e
            );
        }

        if ($e instanceof TokenMismatchException) {
            return $this->errorResponse(
                'Session expired. Please refresh the page and try again.',
                419,
                null,
                $e
            );
        }

        if ($e instanceof QueryException) {
            return $this->errorResponse(
                'A database error occurred. Please try again later.',
                503,
                null,
                $e
            );
        }

        $statusCode = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
        $message = config('app.debug') ? $e->getMessage() : 'An internal server error occurred.';

        return $this->errorResponse(
            $message,
            $statusCode,
            null,
            $e
        );
    }

    private function errorResponse(string $message, int $code, $errors = null, ?Throwable $e = null)
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        if (config('app.debug') && $e !== null) {
            $response['debug'] = [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ];
        }

        return response()->json($response, $code);
    }
}
