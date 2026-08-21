<?php

namespace App\Http\Requests\Robotics;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoboticsReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'equipment_id' => ['required', 'integer', 'exists:robotics_equipment,id'],
            'team_id' => ['nullable', 'integer', 'exists:robotics_teams,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'purpose' => ['nullable', 'string', 'max:500'],
        ];
    }
}
