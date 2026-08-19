<?php

namespace App\Services\Website;

use App\Models\BlogPost;
use App\Models\ContactMessage;
use App\Models\PageView;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function siteStats(): array
    {
        $today = now()->startOfDay();
        $days7 = now()->subDays(6)->startOfDay();
        $days30 = now()->subDays(29)->startOfDay();

        return [
            'totals' => [
                'page_views' => PageView::count(),
                'unique_visitors' => PageView::whereNotNull('visitor_id')->distinct('visitor_id')->count('visitor_id'),
                'page_views_today' => PageView::where('created_at', '>=', $today)->count(),
                'page_views_7d' => PageView::where('created_at', '>=', $days7)->count(),
                'page_views_30d' => PageView::where('created_at', '>=', $days30)->count(),
                'contact_messages' => ContactMessage::count(),
                'unread_contact_messages' => ContactMessage::where('status', 'new')->count(),
            ],
            'views_by_day' => PageView::query()
                ->select(DB::raw("DATE(created_at) as date"), DB::raw('count(*) as views'))
                ->where('created_at', '>=', $days30)
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(fn ($row) => ['date' => $row->date, 'views' => (int) $row->views]),
            'top_pages' => PageView::query()
                ->select('path', DB::raw('count(*) as views'))
                ->groupBy('path')
                ->orderByDesc('views')
                ->limit(10)
                ->get()
                ->map(fn ($row) => ['path' => $row->path, 'views' => (int) $row->views]),
            'devices' => [
                'mobile' => PageView::where('is_mobile', true)->count(),
                'desktop' => PageView::where('is_mobile', false)->count(),
            ],
            'blog' => [
                'total_views' => BlogPost::sum('views'),
                'top_posts' => BlogPost::query()
                    ->published()
                    ->orderByDesc('views')
                    ->limit(5)
                    ->get(['title', 'slug', 'views']),
            ],
            'contact_message_stats' => [
                'new' => ContactMessage::where('status', 'new')->count(),
                'read' => ContactMessage::where('status', 'read')->count(),
                'replied' => ContactMessage::where('status', 'replied')->count(),
                'archived' => ContactMessage::where('status', 'archived')->count(),
            ],
        ];
    }
}
