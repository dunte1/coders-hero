<?php

namespace App\Services\Inventory;

use App\Models\InventoryItem;
use App\Models\StockMovement;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class StockService
{
    public function index(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return InventoryItem::query()
            ->with(['category', 'location'])
            ->withCount('movements')
            ->when(($filters['low_stock'] ?? false) && $filters['low_stock'] !== 'false', fn ($q) => $q->lowStock())
            ->byCategory($filters['category_id'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function show(int $id): InventoryItem
    {
        return InventoryItem::query()
            ->with(['category', 'location'])
            ->withCount('movements')
            ->findOrFail($id);
    }

    public function store(array $data): InventoryItem
    {
        $data['created_by_user_id'] = auth()->id();

        return InventoryItem::create($data);
    }

    public function update(int $id, array $data): InventoryItem
    {
        $item = InventoryItem::findOrFail($id);
        $item->update($data);

        return $this->show($item->id);
    }

    public function destroy(int $id): bool
    {
        return (bool) InventoryItem::findOrFail($id)->delete();
    }

    // ---- Movements ----

    public function movements(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return StockMovement::query()
            ->with(['item', 'user'])
            ->when($filters['inventory_item_id'] ?? null, fn ($q, $id) => $q->where('inventory_item_id', $id))
            ->byType($filters['type'] ?? null)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function recordMovement(int $itemId, array $data): StockMovement
    {
        $item = InventoryItem::findOrFail($itemId);

        $type = $data['type'];
        $quantity = (int) $data['quantity'];

        // Normalise: 'in' is always positive; 'out'/'adjustment' carry a signed delta.
        $delta = match ($type) {
            'in' => abs($quantity),
            'out' => -abs($quantity),
            'adjustment' => $quantity, // signed by the caller
        };

        $newQuantity = $item->quantity + $delta;

        if ($newQuantity < 0) {
            throw new \InvalidArgumentException('Movement would make stock negative.');
        }

        $movement = StockMovement::create([
            'inventory_item_id' => $item->id,
            'type' => $type,
            'quantity' => $delta,
            'reference' => $data['reference'] ?? null,
            'note' => $data['note'] ?? null,
            'user_id' => auth()->id(),
        ]);

        $item->update(['quantity' => $newQuantity]);

        return $movement->load(['item', 'user']);
    }

    public function lowStockItems(int $limit = 20): \Illuminate\Database\Eloquent\Collection
    {
        return InventoryItem::query()
            ->with(['category', 'location'])
            ->lowStock()
            ->orderByRaw('quantity - reorder_level asc')
            ->limit($limit)
            ->get();
    }
}
