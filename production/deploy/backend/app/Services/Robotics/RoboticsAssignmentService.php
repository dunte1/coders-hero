<?php

namespace App\Services\Robotics;

use App\Models\RoboticsEquipment;
use App\Models\RoboticsEquipmentAssignment;
use App\Models\RoboticsTeam;
use App\Models\Student;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;

class RoboticsAssignmentService
{
    public function __construct(
        private RoboticsEquipmentService $equipmentService
    ) {}

    public function index(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = RoboticsEquipmentAssignment::query()
            ->with(['equipment', 'assignable', 'assignedBy'])
            ->orderByDesc('assigned_at');

        if (($filters['status'] ?? null) && $filters['status'] !== 'all') {
            if ($filters['status'] === 'returned') {
                $query->whereNotNull('returned_at');
            } elseif ($filters['status'] === 'overdue') {
                $query->whereNull('returned_at')
                    ->whereNotNull('expected_return_at')
                    ->where('expected_return_at', '<', now());
            } else {
                $query->whereNull('returned_at');
            }
        }

        if ($filters['equipment_id'] ?? null) {
            $query->where('equipment_id', $filters['equipment_id']);
        }

        return $query->paginate($perPage);
    }

    public function assign(int $equipmentId, array $data): RoboticsEquipmentAssignment
    {
        $equipment = RoboticsEquipment::findOrFail($equipmentId);

        if ($equipment->isRetired()) {
            throw new \InvalidArgumentException('Cannot assign retired equipment.');
        }

        $assignable = $this->resolveAssignable($data['assignable_type'], $data['assignable_id']);

        $quantity = (int) ($data['quantity'] ?? 1);

        if ($quantity < 1) {
            throw new \InvalidArgumentException('Quantity must be at least 1.');
        }

        if ($quantity > $equipment->quantity_available) {
            throw new \InvalidArgumentException(
                "Only {$equipment->quantity_available} unit(s) available."
            );
        }

        $assignment = RoboticsEquipmentAssignment::create([
            'equipment_id' => $equipment->id,
            'assignable_type' => $assignable->getMorphClass(),
            'assignable_id' => $assignable->getKey(),
            'quantity' => $quantity,
            'assigned_at' => $data['assigned_at'] ?? now(),
            'expected_return_at' => $data['expected_return_at'] ?? null,
            'note' => $data['note'] ?? null,
            'assigned_by_user_id' => $data['assigned_by_user_id'] ?? auth()->id(),
        ]);

        $equipment->decrement('quantity_available', $quantity);

        return $assignment->load(['equipment', 'assignable', 'assignedBy']);
    }

    public function return(int $assignmentId): RoboticsEquipmentAssignment
    {
        $assignment = RoboticsEquipmentAssignment::findOrFail($assignmentId);

        if ($assignment->returned_at !== null) {
            return $assignment->load(['equipment', 'assignable', 'assignedBy']);
        }

        $assignment->update(['returned_at' => now()]);

        RoboticsEquipment::where('id', $assignment->equipment_id)
            ->increment('quantity_available', $assignment->quantity);

        return $assignment->load(['equipment', 'assignable', 'assignedBy']);
    }

    public function show(int $assignmentId): RoboticsEquipmentAssignment
    {
        return RoboticsEquipmentAssignment::with(['equipment', 'assignable', 'assignedBy'])
            ->findOrFail($assignmentId);
    }

    private function resolveAssignable(string $type, int $id)
    {
        if ($type === 'student') {
            return Student::findOrFail($id);
        }

        if ($type === 'team') {
            return RoboticsTeam::findOrFail($id);
        }

        throw new \InvalidArgumentException('assignable_type must be student or team.');
    }
}
