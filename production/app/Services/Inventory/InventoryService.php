<?php

namespace App\Services\Inventory;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetMaintenanceRecord;
use App\Models\InventoryItem;
use App\Models\Location;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class InventoryService
{
    public function summary(): array
    {
        return [
            'total_assets' => Asset::count(),
            'available_assets' => Asset::where('status', 'available')->count(),
            'assigned_assets' => Asset::where('status', 'assigned')->count(),
            'in_maintenance_assets' => Asset::where('status', 'in_maintenance')->count(),
            'disposed_assets' => Asset::where('status', 'disposed')->count(),
            'total_stock_items' => InventoryItem::count(),
            'total_stock_units' => (int) InventoryItem::sum('quantity'),
            'low_stock_items' => InventoryItem::query()->lowStock()->count(),
            'open_maintenance' => AssetMaintenanceRecord::where('status', '!=', 'resolved')->count(),
            'categories' => AssetCategory::count(),
            'locations' => Location::count(),
            'assets_by_status' => Asset::selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->orderBy('status')
                ->get()
                ->pluck('count', 'status')
                ->toArray(),
            'assets_by_category' => Asset::selectRaw('asset_categories.name, count(assets.id) as count')
                ->leftJoin('asset_categories', 'asset_categories.id', '=', 'assets.asset_category_id')
                ->groupBy('asset_categories.name')
                ->orderBy('asset_categories.name')
                ->get()
                ->pluck('count', 'name')
                ->toArray(),
            'stock_value' => (float) InventoryItem::selectRaw('SUM(quantity * unit_cost) as value')->value('value') ?? 0,
        ];
    }

    // ---- Categories ----

    public function categories(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return AssetCategory::query()
            ->withCount(['assets', 'inventoryItems'])
            ->search($filters['search'] ?? null)
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function allCategories(): \Illuminate\Database\Eloquent\Collection
    {
        return AssetCategory::active()->orderBy('name')->get();
    }

    public function showCategory(int $id): AssetCategory
    {
        return AssetCategory::query()->withCount(['assets', 'inventoryItems'])->findOrFail($id);
    }

    public function storeCategory(array $data): AssetCategory
    {
        $data['created_by_user_id'] = auth()->id();

        return AssetCategory::create($data);
    }

    public function updateCategory(int $id, array $data): AssetCategory
    {
        $category = AssetCategory::findOrFail($id);
        $category->update($data);

        return $category->fresh();
    }

    public function destroyCategory(int $id): bool
    {
        $category = AssetCategory::findOrFail($id);

        if ($category->assets()->exists() || $category->inventoryItems()->exists()) {
            throw new \InvalidArgumentException('Cannot delete a category that is in use.');
        }

        return (bool) $category->delete();
    }

    // ---- Locations ----

    public function locations(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return Location::query()
            ->withCount(['assets', 'inventoryItems'])
            ->search($filters['search'] ?? null)
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function allLocations(): \Illuminate\Database\Eloquent\Collection
    {
        return Location::active()->orderBy('name')->get();
    }

    public function showLocation(int $id): Location
    {
        return Location::query()->withCount(['assets', 'inventoryItems'])->findOrFail($id);
    }

    public function storeLocation(array $data): Location
    {
        $data['created_by_user_id'] = auth()->id();

        return Location::create($data);
    }

    public function updateLocation(int $id, array $data): Location
    {
        $location = Location::findOrFail($id);
        $location->update($data);

        return $location->fresh();
    }

    public function destroyLocation(int $id): bool
    {
        $location = Location::findOrFail($id);

        if ($location->assets()->exists() || $location->inventoryItems()->exists()) {
            throw new \InvalidArgumentException('Cannot delete a location that is in use.');
        }

        return (bool) $location->delete();
    }
}
