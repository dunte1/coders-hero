<?php

namespace App\Services\Robotics;

use App\Models\RoboticsEquipment;
use App\Models\RoboticsEquipmentReservation;
use Illuminate\Pagination\LengthAwarePaginator;

class RoboticsReservationService
{
    public function index(array $filters, ?string $userId = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = RoboticsEquipmentReservation::query()
            ->with(['equipment', 'team', 'reservedBy', 'reviewedBy'])
            ->orderByDesc('created_at');

        if ($userId) {
            $query->where('reserved_by_user_id', $userId);
        }

        if (($filters['status'] ?? null) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if ($filters['equipment_id'] ?? null) {
            $query->where('equipment_id', $filters['equipment_id']);
        }

        return $query->paginate($perPage);
    }

    public function store(string $userId, array $data): RoboticsEquipmentReservation
    {
        $equipment = RoboticsEquipment::findOrFail($data['equipment_id']);

        if ($equipment->isRetired()) {
            throw new \InvalidArgumentException('Cannot reserve retired equipment.');
        }

        $quantity = (int) ($data['quantity'] ?? 1);

        if ($quantity < 1) {
            throw new \InvalidArgumentException('Quantity must be at least 1.');
        }

        if ($quantity > $equipment->quantity_available) {
            throw new \InvalidArgumentException(
                "Only {$equipment->quantity_available} unit(s) available."
            );
        }

        if (isset($data['start_at'], $data['end_at'])
            && strtotime($data['end_at']) <= strtotime($data['start_at'])) {
            throw new \InvalidArgumentException('End time must be after start time.');
        }

        return RoboticsEquipmentReservation::create([
            'equipment_id' => $equipment->id,
            'team_id' => $data['team_id'] ?? null,
            'reserved_by_user_id' => $userId,
            'quantity' => $quantity,
            'start_at' => $data['start_at'],
            'end_at' => $data['end_at'],
            'purpose' => $data['purpose'] ?? null,
            'status' => 'pending',
        ])->load(['equipment', 'team', 'reservedBy']);
    }

    public function cancel(int $reservationId, string $userId): RoboticsEquipmentReservation
    {
        $reservation = RoboticsEquipmentReservation::findOrFail($reservationId);

        if ($reservation->reserved_by_user_id !== $userId
            && !auth()->user()?->hasAnyRole(['admin', 'super_admin', 'teacher', 'instructor'])) {
            throw new \RuntimeException('You are not allowed to cancel this reservation.', 403);
        }

        if (in_array($reservation->status, ['cancelled', 'rejected', 'completed'], true)) {
            return $reservation->load(['equipment', 'team', 'reservedBy']);
        }

        $reservation->update(['status' => 'cancelled']);

        return $reservation->load(['equipment', 'team', 'reservedBy']);
    }

    public function review(int $reservationId, string $status, ?string $reviewerUserId = null): RoboticsEquipmentReservation
    {
        if (!in_array($status, ['approved', 'rejected', 'completed'], true)) {
            throw new \InvalidArgumentException('Invalid review status.');
        }

        $reservation = RoboticsEquipmentReservation::findOrFail($reservationId);

        if (in_array($reservation->status, ['cancelled', 'rejected', 'completed'], true)) {
            throw new \InvalidArgumentException("Reservation is already {$reservation->status}.");
        }

        $reservation->update([
            'status' => $status,
            'reviewed_by_user_id' => $reviewerUserId ?? auth()->id(),
            'reviewed_at' => now(),
        ]);

        return $reservation->load(['equipment', 'team', 'reservedBy', 'reviewedBy']);
    }
}
