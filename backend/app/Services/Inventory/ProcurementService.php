<?php

namespace App\Services\Inventory;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProcurementService
{
    public function __construct(
        private ?StockService $stockService = null
    ) {}

    // ---- Suppliers ----

    public function indexSuppliers(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return Supplier::query()
            ->search($filters['search'] ?? null)
            ->when(($filters['status'] ?? null), fn ($q, $v) => $q->where('status', $v))
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function storeSupplier(array $data): Supplier
    {
        return Supplier::create($data);
    }

    public function showSupplier(int $id): Supplier
    {
        return Supplier::withCount('purchaseOrders')->findOrFail($id);
    }

    public function updateSupplier(int $id, array $data): Supplier
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->update($data);

        return $supplier->fresh();
    }

    public function destroySupplier(int $id): bool
    {
        return (bool) Supplier::findOrFail($id)->delete();
    }

    // ---- Purchase Orders ----

    public function indexPurchaseOrders(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return PurchaseOrder::query()
            ->with(['supplier:id,name', 'createdBy:id,name'])
            ->byStatus($filters['status'] ?? null)
            ->search($filters['search'] ?? null)
            ->when(($filters['supplier_id'] ?? null), fn ($q, $v) => $q->where('supplier_id', $v))
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function storePurchaseOrder(array $data): PurchaseOrder
    {
        $items = $data['items'] ?? [];
        unset($data['items']);

        $data['po_number'] = $data['po_number'] ?? $this->generatePoNumber();
        $data['created_by'] = auth()->id();

        $order = PurchaseOrder::create($data);

        foreach ($items as $item) {
            $item['total_price'] = $item['quantity'] * $item['unit_price'];
            $order->items()->create($item);
        }

        $this->recalculateTotal($order);

        return $order->fresh(['supplier', 'createdBy', 'items']);
    }

    public function showPurchaseOrder(int $id): PurchaseOrder
    {
        return PurchaseOrder::with(['supplier', 'createdBy:id,name', 'items'])->findOrFail($id);
    }

    public function updatePurchaseOrder(int $id, array $data): PurchaseOrder
    {
        $order = PurchaseOrder::findOrFail($id);

        $items = $data['items'] ?? null;
        unset($data['items']);

        $order->update($data);

        if ($items !== null) {
            $order->items()->delete();

            foreach ($items as $item) {
                $item['total_price'] = $item['quantity'] * $item['unit_price'];
                $order->items()->create($item);
            }
        }

        $this->recalculateTotal($order);

        return $order->fresh(['supplier', 'createdBy', 'items']);
    }

    public function destroyPurchaseOrder(int $id): bool
    {
        return (bool) PurchaseOrder::findOrFail($id)->delete();
    }

    public function changeStatus(int $id, string $status): PurchaseOrder
    {
        $order = PurchaseOrder::findOrFail($id);
        $order->update(['status' => $status]);

        if ($status === 'received' && $this->stockService) {
            $this->receiveStock($order);
        }

        return $order->fresh(['supplier', 'createdBy', 'items']);
    }

    private function recalculateTotal(PurchaseOrder $order): void
    {
        $total = $order->items()->sum('total_price');
        $order->update(['total_amount' => $total]);
    }

    private function generatePoNumber(): string
    {
        $last = PurchaseOrder::orderByDesc('id')->value('po_number');
        $number = 1;

        if ($last && preg_match('/PO-(\d+)/', $last, $m)) {
            $number = (int) $m[1] + 1;
        }

        return 'PO-' . str_pad($number, 6, '0', STR_PAD_LEFT);
    }

    private function receiveStock(PurchaseOrder $order): void
    {
        foreach ($order->items as $item) {
            // Try to find existing inventory item by description match
            $inventoryItem = \App\Models\InventoryItem::where('name', $item->description)->first();

            if ($inventoryItem && $this->stockService) {
                $this->stockService->recordMovement($inventoryItem->id, [
                    'type' => 'in',
                    'quantity' => $item->quantity,
                    'reference' => $order->po_number,
                    'note' => "Received from PO {$order->po_number}",
                ]);
            }
        }
    }
}
