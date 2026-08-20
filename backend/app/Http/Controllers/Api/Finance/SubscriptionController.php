<?php
namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $subscriptions = Subscription::where('user_id', auth()->id())->latest()->get();
        return $this->successResponse($subscriptions, 'Subscriptions retrieved');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan' => 'required|in:monthly,termly,annual',
        ]);

        $amounts = ['monthly' => 2500, 'termly' => 6000, 'annual' => 15000];
        $endsAt = match($validated['plan']) {
            'monthly' => now()->addMonth(),
            'termly' => now()->addMonths(3),
            'annual' => now()->addYear(),
        };

        $subscription = Subscription::create([
            'user_id' => auth()->id(),
            'plan' => $validated['plan'],
            'amount' => $amounts[$validated['plan']],
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => $endsAt,
            'next_billing_date' => $endsAt,
        ]);

        return $this->createdResponse($subscription, 'Subscription created');
    }

    public function cancel(int $id): JsonResponse
    {
        $subscription = Subscription::where('user_id', auth()->id())->findOrFail($id);
        $subscription->update(['status' => 'cancelled']);
        return $this->successResponse($subscription->fresh(), 'Subscription cancelled');
    }
}
