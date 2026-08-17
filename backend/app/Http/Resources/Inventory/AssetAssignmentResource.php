<?php

namespace App\Http\Resources\Inventory;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $assignee = $this->whenLoaded('assignee');
        $assigneeName = null;

        if ($assignee) {
            $assigneeName = match (true) {
                $assignee instanceof \App\Models\Student => $assignee->full_name,
                $assignee instanceof \App\Models\Employee => $assignee->user?->name ?? $assignee->employee_id,
                default => $assignee->name ?? null,
            };
        }

        $type = match ($this->assignee_type) {
            \App\Models\Student::class => 'student',
            \App\Models\Employee::class => 'employee',
            \App\Models\RoboticsTeam::class => 'robotics_team',
            default => $this->assignee_type,
        };

        return [
            'id' => $this->id,
            'asset_id' => $this->asset_id,
            'assignee_type' => $type,
            'assignee_id' => $this->assignee_id,
            'assignee' => $assignee ? [
                'id' => $this->assignee->id,
                'name' => $assigneeName,
                'type' => $type,
            ] : null,
            'assigned_at' => $this->assigned_at?->toISOString(),
            'expected_return_at' => $this->expected_return_at?->toISOString(),
            'returned_at' => $this->returned_at?->toISOString(),
            'note' => $this->note,
            'assigned_by' => $this->whenLoaded('assignedBy', fn () => new UserResource($this->assignedBy)),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
