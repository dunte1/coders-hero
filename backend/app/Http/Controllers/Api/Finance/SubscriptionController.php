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
            'payment_method' => 'required|in:stripe,mpesa',
            'payment_reference' => 'nullable|string|max:255',
        ]);

        $planConfig = config('subscriptions.plans.' . $validated['plan']);

        if (!$planConfig) {
            return $this->errorResponse('Invalid subscription plan.', 422);
        }

        $endsAt = match($validated['plan']) {
            'monthly' => now()->addMonth(),
            'termly' => now()->addMonths(3),
            'annual' => now()->addYear(),
        };

        $subscription = Subscription::create([
            'user_id' => auth()->id(),
            'plan' => $validated['plan'],
            'amount' => $planConfig['amount'],
            'status' => 'pending',
            'payment_method' => $validated['payment_method'],
            'payment_reference' => $validated['payment_reference'] ?? null,
            'starts_at' => now(),
            'ends_at' => $endsAt,
            'next_billing_date' => $endsAt,
        ]);

        return $this->createdResponse($subscription, 'Subscription pending payment confirmation');
    }

    public function cancel(int $id): JsonResponse
    {
        $subscription = Subscription::where('user_id', auth()->id())->findOrFail($id);
        $subscription->update(['status' => 'cancelled']);
        return $this->successResponse($subscription->fresh(), 'Subscription cancelled');
    }
}
