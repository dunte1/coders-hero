<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::query();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $search = $request->input('search');
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%')
                    ->orWhere('subject', 'like', '%' . $search . '%');
            });
        }

        $query->orderByDesc('created_at');

        return $this->paginatedResponse(
            $query->paginate((int) $request->input('per_page', 20))->withQueryString()
        );
    }

    public function show(int $id): JsonResponse
    {
        $message = ContactMessage::find($id);

        if (!$message) {
            return $this->notFoundResponse('Contact message not found.');
        }

        if ($message->status === 'new') {
            $message->update(['status' => 'read']);
        }

        return $this->successResponse(
            new ContactMessageResource($message->fresh()),
            'Contact message retrieved successfully.'
        );
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'in:new,read,replied,archived'],
        ]);

        $updates = ['status' => $validated['status']];
        if ($validated['status'] === 'replied') {
            $updates['replied_at'] = $message->replied_at ?? now();
        }

        $message->update($updates);

        return $this->successResponse(
            new ContactMessageResource($message->fresh()),
            'Contact message status updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        ContactMessage::findOrFail($id)->delete();

        return $this->noContentResponse('Contact message deleted successfully.');
    }

    public function stats(): JsonResponse
    {
        return $this->successResponse([
            'new' => ContactMessage::where('status', 'new')->count(),
            'read' => ContactMessage::where('status', 'read')->count(),
            'replied' => ContactMessage::where('status', 'replied')->count(),
            'archived' => ContactMessage::where('status', 'archived')->count(),
            'total' => ContactMessage::count(),
        ], 'Contact message stats retrieved successfully.');
    }
}
