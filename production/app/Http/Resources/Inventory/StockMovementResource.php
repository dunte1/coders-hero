<?php

namespace App\Http\Resources\Inventory;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockMovementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'inventory_item_id' => $this->inventory_item_id,
            'item' => $this->whenLoaded('item', fn () => new InventoryItemResource($this->item)),
            'type' => $this->type,
            'quantity' => $this->quantity,
            'reference' => $this->reference,
            'note' => $this->note,
            'user' => $this->whenLoaded('user', fn () => new UserResource($this->user)),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
