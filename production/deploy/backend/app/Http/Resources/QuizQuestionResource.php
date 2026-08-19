<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizQuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $includeAnswer = $request->user() && $request->user()->hasAnyRole(['admin', 'instructor']);

        return [
            'id' => $this->id,
            'quiz_id' => $this->quiz_id,
            'question' => $this->question,
            'type' => $this->type,
            'options' => $this->options,
            'correct_answer' => $this->when($includeAnswer, $this->correct_answer),
            'explanation' => $this->when($includeAnswer, $this->explanation),
            'points' => $this->points,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
