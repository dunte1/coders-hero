<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearningStreak;
use App\Models\Badge;
use App\Models\PointsTransaction;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class GamificationController extends Controller
{
    use ApiResponse;

    public function streak(): JsonResponse
    {
        $streak = LearningStreak::firstOrCreate(
            ['user_id' => auth()->id()],
            ['current_streak' => 0, 'longest_streak' => 0]
        );
        return $this->successResponse($streak, 'Streak retrieved');
    }

    public function badges(): JsonResponse
    {
        $badges = Badge::with(['users' => fn($q) => $q->where('user_id', auth()->id())])->get();
        return $this->successResponse($badges, 'Badges retrieved');
    }

    public function points(): JsonResponse
    {
        $total = PointsTransaction::where('user_id', auth()->id())->sum('points');
        $recent = PointsTransaction::where('user_id', auth()->id())
            ->latest()
            ->limit(10)
            ->get();
        return $this->successResponse([
            'total_points' => (int) $total,
            'recent_transactions' => $recent,
        ], 'Points retrieved');
    }

    public function leaderboard(): JsonResponse
    {
        $leaderboard = PointsTransaction::select('user_id', \DB::raw('SUM(points) as total_points'))
            ->with('user:id,name,avatar')
            ->groupBy('user_id')
            ->orderByDesc('total_points')
            ->limit(50)
            ->get();
        return $this->successResponse($leaderboard, 'Leaderboard retrieved');
    }
}
