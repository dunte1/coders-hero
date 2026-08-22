<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FreeTrialBooking;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FreeTrialController extends Controller
{
    use ApiResponse;

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'parent_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'child_name' => 'required|string|max:255',
            'grade' => 'required|string|max:50',
        ]);

        $booking = FreeTrialBooking::create($validated);

        \App\Jobs\SendFreeTrialConfirmationJob::dispatch($booking);

        return $this->createdResponse($booking, 'Free trial booking submitted successfully');
    }

    public function index(): JsonResponse
    {
        $bookings = FreeTrialBooking::latest()->paginate(20);
        return $this->paginatedResponse($bookings, 'Free trial bookings');
    }
}
