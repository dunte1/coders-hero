import api from '@/lib/axios';
import type { Page, PaginationMeta } from '@/types/cms';
import type {
  Asset,
  AssetAssignment,
  AssetCategory,
  AssetCondition,
  AssetMaintenanceRecord,
  AssetStatus,
  InventoryItem,
  InventoryQueryParams,
  InventorySummary,
  Location,
  MaintenanceStatus,
  StockMovement,
  StockMovementType,
} from '@/types/inventory';

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

export interface CategoryInput {
  name: string;
  description?: string | null;
  is_active?: boolean;
}

export interface LocationInput {
  name: string;
  code: string;
  description?: string | null;
  is_active?: boolean;
}

export interface AssetInput {
  name: string;
  asset_category_id: number;
  location_id?: number | null;
  serial_number?: string | null;
  status?: AssetStatus;
  condition?: AssetCondition;
  purchase_date?: string | null;
  purchase_cost?: number | null;
  supplier?: string | null;
  notes?: string | null;
  robotics_equipment_id?: number | null;
}

export interface AssignAssetInput {
  assignee_type: 'student' | 'employee' | 'robotics_team';
  assignee_id: number;
  expected_return_at?: string | null;
  note?: string | null;
}

export interface MaintenanceInput {
  asset_id: number;
  maintenance_date: string;
  description: string;
  status?: MaintenanceStatus;
  cost?: number | null;
  note?: string | null;
}

export interface InventoryItemInput {
  name: string;
  sku: string;
  asset_category_id: number;
  location_id?: number | null;
  quantity?: number;
  unit?: string;
  reorder_level?: number;
  unit_cost?: number | null;
  supplier?: string | null;
  notes?: string | null;
  is_active?: boolean;
}

export interface StockMovementInput {
  type: StockMovementType;
  quantity: number;
  reference?: string | null;
  note?: string | null;
}

export const inventoryApi = {
  // Summary
  summary: () => api.get<{ data: InventorySummary }>('/inventory/summary').then(unwrap<InventorySummary>),

  // Categories
  categories: (params?: InventoryQueryParams) =>
    api.get<{ data: AssetCategory[]; meta: PaginationMeta }>('/inventory/categories', { params }).then(unwrapPage<AssetCategory>),

  categoryOptions: () => api.get<{ data: AssetCategory[] }>('/inventory/categories/options').then(unwrap<AssetCategory[]>),

  category: (id: number) =>
    api.get<{ data: AssetCategory }>(`/inventory/categories/${id}`).then(unwrap<AssetCategory>),

  createCategory: (data: CategoryInput) =>
    api.post<{ data: AssetCategory }>('/inventory/categories', data).then(unwrap<AssetCategory>),

  updateCategory: (id: number, data: Partial<CategoryInput>) =>
    api.put<{ data: AssetCategory }>(`/inventory/categories/${id}`, data).then(unwrap<AssetCategory>),

  deleteCategory: (id: number) =>
    api.delete<{ data: null }>(`/inventory/categories/${id}`).then(() => undefined),

  // Locations
  locations: (params?: InventoryQueryParams) =>
    api.get<{ data: Location[]; meta: PaginationMeta }>('/inventory/locations', { params }).then(unwrapPage<Location>),

  locationOptions: () => api.get<{ data: Location[] }>('/inventory/locations/options').then(unwrap<Location[]>),

  location: (id: number) =>
    api.get<{ data: Location }>(`/inventory/locations/${id}`).then(unwrap<Location>),

  createLocation: (data: LocationInput) =>
    api.post<{ data: Location }>('/inventory/locations', data).then(unwrap<Location>),

  updateLocation: (id: number, data: Partial<LocationInput>) =>
    api.put<{ data: Location }>(`/inventory/locations/${id}`, data).then(unwrap<Location>),

  deleteLocation: (id: number) =>
    api.delete<{ data: null }>(`/inventory/locations/${id}`).then(() => undefined),

  // Assets
  assets: (params?: InventoryQueryParams) =>
    api.get<{ data: Asset[]; meta: PaginationMeta }>('/inventory/assets', { params }).then(unwrapPage<Asset>),

  asset: (id: number) =>
    api.get<{ data: Asset }>(`/inventory/assets/${id}`).then(unwrap<Asset>),

  createAsset: (data: AssetInput) =>
    api.post<{ data: Asset }>('/inventory/assets', data).then(unwrap<Asset>),

  updateAsset: (id: number, data: Partial<AssetInput>) =>
    api.put<{ data: Asset }>(`/inventory/assets/${id}`, data).then(unwrap<Asset>),

  deleteAsset: (id: number) =>
    api.delete<{ data: null }>(`/inventory/assets/${id}`).then(() => undefined),

  scanAsset: (qrCode: string) =>
    api.get<{ data: Asset }>(`/inventory/assets/scan/${encodeURIComponent(qrCode)}`).then(unwrap<Asset>),

  assignAsset: (id: number, data: AssignAssetInput) =>
    api.post<{ data: AssetAssignment }>(`/inventory/assets/${id}/assign`, data).then(unwrap<AssetAssignment>),

  checkInAsset: (id: number, note?: string | null) =>
    api.post<{ data: Asset }>(`/inventory/assets/${id}/check-in`, { note: note ?? null }).then(unwrap<Asset>),

  disposeAsset: (id: number, note?: string | null) =>
    api.post<{ data: Asset }>(`/inventory/assets/${id}/dispose`, { note: note ?? null }).then(unwrap<Asset>),

  assetAssignments: (id: number, params?: { page?: number; per_page?: number }) =>
    api.get<{ data: AssetAssignment[]; meta: PaginationMeta }>(`/inventory/assets/${id}/assignments`, { params }).then(unwrapPage<AssetAssignment>),

  assetQrCode: (id: number) =>
    api.get<{ data: { qr_code: string } }>(`/inventory/assets/${id}/qr`).then(unwrap<{ qr_code: string }>),

  // Maintenance
  maintenance: (params?: { page?: number; per_page?: number; status?: MaintenanceStatus | 'all'; asset_id?: number; search?: string }) =>
    api.get<{ data: AssetMaintenanceRecord[]; meta: PaginationMeta }>('/inventory/maintenance', { params }).then(unwrapPage<AssetMaintenanceRecord>),

  maintenanceRecord: (id: number) =>
    api.get<{ data: AssetMaintenanceRecord }>(`/inventory/maintenance/${id}`).then(unwrap<AssetMaintenanceRecord>),

  createMaintenance: (data: MaintenanceInput) =>
    api.post<{ data: AssetMaintenanceRecord }>('/inventory/maintenance', data).then(unwrap<AssetMaintenanceRecord>),

  updateMaintenance: (id: number, data: Partial<MaintenanceInput>) =>
    api.put<{ data: AssetMaintenanceRecord }>(`/inventory/maintenance/${id}`, data).then(unwrap<AssetMaintenanceRecord>),

  deleteMaintenance: (id: number) =>
    api.delete<{ data: null }>(`/inventory/maintenance/${id}`).then(() => undefined),

  // Stock items
  items: (params?: InventoryQueryParams) =>
    api.get<{ data: InventoryItem[]; meta: PaginationMeta }>('/inventory/items', { params }).then(unwrapPage<InventoryItem>),

  lowStockItems: () => api.get<{ data: InventoryItem[] }>('/inventory/items/low-stock').then(unwrap<InventoryItem[]>),

  item: (id: number) =>
    api.get<{ data: InventoryItem }>(`/inventory/items/${id}`).then(unwrap<InventoryItem>),

  createItem: (data: InventoryItemInput) =>
    api.post<{ data: InventoryItem }>('/inventory/items', data).then(unwrap<InventoryItem>),

  updateItem: (id: number, data: Partial<InventoryItemInput>) =>
    api.put<{ data: InventoryItem }>(`/inventory/items/${id}`, data).then(unwrap<InventoryItem>),

  deleteItem: (id: number) =>
    api.delete<{ data: null }>(`/inventory/items/${id}`).then(() => undefined),

  // Movements
  movements: (params?: { page?: number; per_page?: number; type?: StockMovementType | 'all'; item_id?: number; search?: string }) =>
    api.get<{ data: StockMovement[]; meta: PaginationMeta }>('/inventory/movements', { params }).then(unwrapPage<StockMovement>),

  movementsForItem: (itemId: number, params?: { page?: number; per_page?: number }) =>
    api.get<{ data: StockMovement[]; meta: PaginationMeta }>(`/inventory/movements/for-item/${itemId}`, { params }).then(unwrapPage<StockMovement>),

  createMovement: (itemId: number, data: StockMovementInput) =>
    api.post<{ data: StockMovement }>(`/inventory/items/${itemId}/movements`, data).then(unwrap<StockMovement>),
};

export { getErrorMessage } from '@/lib/studentsApi';
