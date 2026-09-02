<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\TicketReply;
use App\Services\Notifications\NotificationDispatcher;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SupportTicketController extends Controller
{
    use ApiResponse;

    public function __construct(
        private NotificationDispatcher $notifications
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = SupportTicket::with(['user', 'assignee']);

        if ($user->hasAnyRole(['admin', 'super_admin'])) {
            if ($request->filled('user_id')) {
                $query->where('user_id', $request->input('user_id'));
            }
        } else {
            $query->where('user_id', $user->id);
        }

        $query->byStatus($request->input('status'));
        $query->byPriority($request->input('priority'));

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $tickets = $query->orderByDesc('created_at')
            ->paginate((int) $request->input('per_page', 15));

        return $this->paginatedResponse($tickets, 'Support tickets retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'category' => ['nullable', 'string', 'in:technical,billing,general,bug_report'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,urgent'],
            'guest_name' => ['nullable', 'string', 'max:255'],
            'guest_email' => ['nullable', 'email', 'max:255'],
        ]);

        $user = $request->user();

        if (!$user && empty($validated['guest_name'])) {
            return $this->errorResponse('Guest name is required for anonymous tickets.', 422);
        }

        if (!$user && empty($validated['guest_email'])) {
            return $this->errorResponse('Guest email is required for anonymous tickets.', 422);
        }

        $ticket = SupportTicket::create([
            'user_id' => $user?->id,
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'category' => $validated['category'] ?? null,
            'priority' => $validated['priority'] ?? 'medium',
            'status' => 'open',
        ]);

        if (!$user) {
            $ticket->guest_name = $validated['guest_name'] ?? null;
            $ticket->guest_email = $validated['guest_email'] ?? null;
        }

        $ticket->load(['user', 'assignee']);

        // Notify admin and super_admin
        $this->notifications->notifyRole(
            ['admin', 'super_admin'],
            'support_ticket_created',
            [
                'ticket_id' => $ticket->id,
                'subject' => $ticket->subject,
                'priority' => $ticket->priority,
                'category' => $ticket->category ?? 'general',
                'user_name' => $user->name ?? 'Anonymous',
                'description' => Str::limit($ticket->description, 200),
            ],
            "/support/{$ticket->id}",
            ['email', 'in_app']
        );

        return $this->createdResponse($ticket, 'Support ticket created successfully.');
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $ticket = SupportTicket::with(['user', 'assignee', 'replies.user'])->find($id);

        if (!$ticket) {
            return $this->notFoundResponse('Support ticket not found.');
        }

        if (!$user->hasAnyRole(['admin', 'super_admin']) && $ticket->user_id !== $user->id) {
            return $this->forbiddenResponse('You do not have access to this ticket.');
        }

        return $this->successResponse($ticket, 'Support ticket retrieved successfully.');
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $ticket = SupportTicket::find($id);

        if (!$ticket) {
            return $this->notFoundResponse('Support ticket not found.');
        }

        if (!$user->hasAnyRole(['admin', 'super_admin']) && $ticket->user_id !== $user->id) {
            return $this->forbiddenResponse('You do not have access to this ticket.');
        }

        $validated = $request->validate([
            'message' => ['required', 'string'],
        ]);

        $reply = TicketReply::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $validated['message'],
            'is_staff' => $user->hasAnyRole(['admin', 'super_admin']),
        ]);

        $reply->load('user');

        // Notify ticket owner (if different from replier) and admins
        $notifyUsers = [];
        if ($ticket->user_id && $ticket->user_id !== $user->id) {
            $notifyUsers[] = $ticket->user;
        }
        $this->notifications->notifyRole(
            ['admin', 'super_admin'],
            'support_ticket_reply',
            [
                'ticket_id' => $ticket->id,
                'subject' => $ticket->subject,
                'replier_name' => $user->name,
                'message' => Str::limit($validated['message'], 200),
                'is_staff' => $user->hasAnyRole(['admin', 'super_admin']),
            ],
            "/support/{$ticket->id}",
            ['email', 'in_app']
        );
        if (!empty($notifyUsers)) {
            $this->notifications->notify(
                $notifyUsers,
                'support_ticket_reply',
                [
                    'ticket_id' => $ticket->id,
                    'subject' => $ticket->subject,
                    'replier_name' => $user->name,
                    'message' => Str::limit($validated['message'], 200),
                    'is_staff' => $user->hasAnyRole(['admin', 'super_admin']),
                ],
                "/support/{$ticket->id}",
                ['email', 'in_app']
            );
        }

        return $this->createdResponse($reply, 'Reply added successfully.');
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $ticket = SupportTicket::find($id);

        if (!$ticket) {
            return $this->notFoundResponse('Support ticket not found.');
        }

        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:open,in_progress,resolved,closed'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,urgent'],
            'assigned_to' => ['nullable', 'uuid', 'exists:users,id'],
        ]);

        $ticket->update($validated);
        $ticket->load(['user', 'assignee']);

        return $this->successResponse($ticket, 'Support ticket updated successfully.');
    }

    public function myTickets(Request $request): JsonResponse
    {
        $user = $request->user();

        $tickets = SupportTicket::where('user_id', $user->id)
            ->with(['assignee'])
            ->byStatus($request->input('status'))
            ->byPriority($request->input('priority'))
            ->orderByDesc('created_at')
            ->paginate((int) $request->input('per_page', 15));

        return $this->paginatedResponse($tickets, 'My support tickets retrieved successfully.');
    }
}
