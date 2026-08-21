<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lms\CodingHintRequest;
use App\Http\Requests\Lms\CodingDebugRequest;
use App\Services\Lms\CodingAiService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CodingAiController extends Controller
{
    use ApiResponse;

    public function __construct(
        private CodingAiService $aiService
    ) {}

    public function hint(CodingHintRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = $this->aiService->hint(
            auth()->id(),
            app('request')->route('exercise_id') ?? 0,
            $validated['code'],
            $validated['error_message'],
        );

        return $this->successResponse($result);
    }

    public function debug(CodingDebugRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = $this->aiService->debug(
            auth()->id(),
            app('request')->route('exercise_id') ?? 0,
            $validated['code'],
            $validated['error_output'],
        );

        return $this->successResponse($result);
    }
}