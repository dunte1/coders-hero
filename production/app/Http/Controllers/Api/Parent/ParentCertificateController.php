<?php

namespace App\Http\Controllers\Api\Parent;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Student;
use App\Services\Parents\ParentPortalService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentCertificateController extends Controller
{
    use ApiResponse;

    public function __construct(private ParentPortalService $portal) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $studentIds = $this->portal->accessibleStudentIds();
            $userIds = Student::whereIn('id', $studentIds)->pluck('user_id')->all();

            $certificates = Certificate::whereIn('user_id', $userIds)
                ->with(['course', 'enrollment'])
                ->latest()
                ->paginate((int) $request->get('per_page', 15));

            return $this->paginatedResponse($certificates, 'Certificates retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve certificates: ' . $e->getMessage(), 500);
        }
    }
}
