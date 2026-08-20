<?php
namespace App\Http\Controllers\Api\School;

use App\Http\Controllers\Controller;
use App\Services\School\SchoolDashboardService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class SchoolDashboardController extends Controller
{
    use ApiResponse;

    public function __construct(
        private SchoolDashboardService $service
    ) {}

    public function summary(): JsonResponse
    {
        $user = auth()->user();
        $data = $this->service->getSummaryForUser($user);
        return $this->successResponse($data, 'School summary retrieved');
    }
}
