<?php

namespace App\Http\Controllers\Api\Parent;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\Parents\ParentPortalService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ParentPortalService $portalService
    ) {}

    public function index(): JsonResponse
    {
        $userId = auth()->id();

        $conversations = Conversation::with(['guardianUser:id,name', 'teacherUser:id,name', 'student:id,first_name,last_name'])
            ->where('guardian_user_id', $userId)
            ->orWhere('teacher_user_id', $userId)
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function (Conversation $conversation) use ($userId) {
                $unread = $conversation->messages()
                    ->where('sender_user_id', '!=', $userId)
                    ->whereNull('read_at')
                    ->count();

                $last = $conversation->messages()->latest()->first();

                $conversation->setAttribute('unread_count', $unread);
                $conversation->setAttribute('last_message', $last?->body);
                $conversation->setAttribute('last_message_at_formatted', $last?->created_at?->diffForHumans());

                return $conversation;
            });

        return $this->successResponse($conversations, 'Conversations retrieved successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $conversation = Conversation::with(['guardianUser:id,name', 'teacherUser:id,name', 'student:id,first_name,last_name'])
            ->find($id);

        if (!$conversation || !$this->isParticipant($conversation)) {
            return $this->notFoundResponse('Conversation not found.');
        }

        $messages = $conversation->messages()->with('sender:id,name')->get();

        return $this->successResponse([
            'conversation' => $conversation,
            'messages' => $messages,
        ], 'Messages retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'teacher_user_id' => ['required', 'string', 'exists:users,id'],
            'student_id' => ['nullable', 'integer', 'exists:students,id'],
            'body' => ['required', 'string', 'max:4000'],
        ]);

        if ($this->portalService->isAdministrator()) {
            $guardianUser = auth()->id();
        } else {
            $guardian = $this->portalService->guardianForUser();
            if (!$guardian) {
                return $this->forbiddenResponse('No guardian profile linked to this account.');
            }
            $guardianUser = auth()->id();
        }

        if (!empty($validated['student_id']) && !$this->portalService->hasAccessToStudent($validated['student_id'])) {
            return $this->forbiddenResponse('You do not have access to this student.');
        }

        $conversation = Conversation::firstOrCreate(
            [
                'guardian_user_id' => $guardianUser,
                'teacher_user_id' => $validated['teacher_user_id'],
                'student_id' => $validated['student_id'] ?? null,
            ],
            ['last_message_at' => now()]
        );

        $message = $conversation->messages()->create([
            'sender_user_id' => auth()->id(),
            'body' => $validated['body'],
        ]);

        $conversation->update(['last_message_at' => now()]);

        return $this->createdResponse($message->load('sender:id,name'), 'Message sent successfully.');
    }

    public function send(Request $request, int $id): JsonResponse
    {
        $conversation = Conversation::find($id);

        if (!$conversation || !$this->isParticipant($conversation)) {
            return $this->notFoundResponse('Conversation not found.');
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:4000'],
        ]);

        $message = $conversation->messages()->create([
            'sender_user_id' => auth()->id(),
            'body' => $validated['body'],
        ]);

        $conversation->update(['last_message_at' => now()]);

        return $this->createdResponse($message->load('sender:id,name'), 'Message sent successfully.');
    }

    public function markRead(int $id): JsonResponse
    {
        $conversation = Conversation::find($id);

        if (!$conversation || !$this->isParticipant($conversation)) {
            return $this->notFoundResponse('Conversation not found.');
        }

        $conversation->messages()
            ->where('sender_user_id', '!=', auth()->id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->successResponse(null, 'Messages marked as read.');
    }

    private function isParticipant(Conversation $conversation): bool
    {
        $userId = auth()->id();

        return $conversation->guardian_user_id === $userId
            || $conversation->teacher_user_id === $userId
            || $this->portalService->isAdministrator();
    }
}
