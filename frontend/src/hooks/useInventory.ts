import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryApi, getErrorMessage, type AssetInput, type AssignAssetInput, type CategoryInput, type InventoryItemInput, type LocationInput, type MaintenanceInput, type StockMovementInput } from '@/lib/inventoryApi';
import type { InventoryQueryParams, MaintenanceStatus, StockMovementType } from '@/types/inventory';

// Summary
export function useInventorySummary() {
  return useQuery({ queryKey: ['inventory', 'summary'], queryFn: () => inventoryApi.summary() });
}

// Categories
export function useInventoryCategories(params?: InventoryQueryParams) {
  return useQuery({ queryKey: ['inventory', 'categories', params], queryFn: () => inventoryApi.categories(params) });
}

export function useCategoryOptions() {
  return useQuery({ queryKey: ['inventory', 'categories', 'options'], queryFn: () => inventoryApi.categoryOptions() });
}

export function useInventoryCategory(id: number) {
  return useQuery({ queryKey: ['inventory', 'categories', 'item', id], queryFn: () => inventoryApi.category(id), enabled: !!id });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryInput) => inventoryApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'categories', 'options'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Category created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoryInput> }) => inventoryApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'categories', 'options'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Category updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'categories', 'options'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Category deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Locations
export function useInventoryLocations(params?: InventoryQueryParams) {
  return useQuery({ queryKey: ['inventory', 'locations', params], queryFn: () => inventoryApi.locations(params) });
}

export function useLocationOptions() {
  return useQuery({ queryKey: ['inventory', 'locations', 'options'], queryFn: () => inventoryApi.locationOptions() });
}

export function useInventoryLocation(id: number) {
  return useQuery({ queryKey: ['inventory', 'locations', 'item', id], queryFn: () => inventoryApi.location(id), enabled: !!id });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LocationInput) => inventoryApi.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'locations'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'locations', 'options'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Location created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LocationInput> }) => inventoryApi.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'locations'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'locations', 'options'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Location updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryApi.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'locations'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'locations', 'options'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Location deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Assets
export function useInventoryAssets(params?: InventoryQueryParams) {
  return useQuery({ queryKey: ['inventory', 'assets', params], queryFn: () => inventoryApi.assets(params) });
}

export function useInventoryAsset(id: number) {
  return useQuery({ queryKey: ['inventory', 'assets', 'item', id], queryFn: () => inventoryApi.asset(id), enabled: !!id });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssetInput) => inventoryApi.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'assets'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Asset created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AssetInput> }) => inventoryApi.updateAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'assets'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Asset updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryApi.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'assets'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Asset deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useAssignAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssignAssetInput }) => inventoryApi.assignAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'assets'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Asset assigned');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useCheckInAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string | null }) => inventoryApi.checkInAsset(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'assets'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Asset checked in');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDisposeAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string | null }) => inventoryApi.disposeAsset(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'assets'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Asset disposed');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useAssetAssignments(id: number, params?: { page?: number; per_page?: number }) {
  return useQuery({ queryKey: ['inventory', 'assets', 'item', id, 'assignments', params], queryFn: () => inventoryApi.assetAssignments(id, params), enabled: !!id });
}

// Maintenance
export function useMaintenanceRecords(params?: { page?: number; per_page?: number; status?: MaintenanceStatus | 'all'; asset_id?: number; search?: string }) {
  return useQuery({ queryKey: ['inventory', 'maintenance', params], queryFn: () => inventoryApi.maintenance(params) });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MaintenanceInput) => inventoryApi.createMaintenance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Maintenance record created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MaintenanceInput> }) => inventoryApi.updateMaintenance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Maintenance record updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryApi.deleteMaintenance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Maintenance record deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Stock items
export function useInventoryItems(params?: InventoryQueryParams) {
  return useQuery({ queryKey: ['inventory', 'items', params], queryFn: () => inventoryApi.items(params) });
}

export function useLowStockItems() {
  return useQuery({ queryKey: ['inventory', 'items', 'low-stock'], queryFn: () => inventoryApi.lowStockItems() });
}

export function useInventoryItem(id: number) {
  return useQuery({ queryKey: ['inventory', 'items', 'item', id], queryFn: () => inventoryApi.item(id), enabled: !!id });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InventoryItemInput) => inventoryApi.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'items', 'low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Stock item created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InventoryItemInput> }) => inventoryApi.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'items', 'low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Stock item updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'items', 'low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Stock item deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Movements
export function useStockMovements(params?: { page?: number; per_page?: number; type?: StockMovementType | 'all'; item_id?: number; search?: string }) {
  return useQuery({ queryKey: ['inventory', 'movements', params], queryFn: () => inventoryApi.movements(params) });
}

export function useMovementsForItem(itemId: number, params?: { page?: number; per_page?: number }) {
  return useQuery({ queryKey: ['inventory', 'movements', 'for-item', itemId, params], queryFn: () => inventoryApi.movementsForItem(itemId, params), enabled: !!itemId });
}

export function useCreateMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: StockMovementInput }) => inventoryApi.createMovement(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'items', 'low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      toast.success('Stock movement recorded');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}
