export type AssetStatus = 'available' | 'assigned' | 'in_maintenance' | 'disposed' | 'lost';

export type AssetCondition = 'new' | 'good' | 'fair' | 'poor';

export type MaintenanceStatus = 'reported' | 'in_progress' | 'resolved';

export type StockMovementType = 'in' | 'out' | 'adjustment';

export type AssigneeType = 'student' | 'employee' | 'robotics_team';

export interface AssetCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  assets_count?: number;
  items_count?: number;
  created_at?: string;
}

export interface Location {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  assets_count?: number;
  items_count?: number;
  created_at?: string;
}

export interface AssetAssignee {
  id: number;
  name: string;
  type: AssigneeType;
}

export interface AssetAssignment {
  id: number;
  asset_id: number;
  assignee_type: AssigneeType;
  assignee_id: number;
  assignee?: AssetAssignee | null;
  assigned_at: string;
  expected_return_at: string | null;
  returned_at: string | null;
  note: string | null;
  assigned_by?: { id: string; name: string } | null;
  created_at?: string;
}

export interface RoboticsEquipmentRef {
  id: number;
  name: string;
  type: string;
  sku: string;
}

export interface Asset {
  id: number;
  asset_code: string;
  name: string;
  category_id: number;
  category?: AssetCategory | null;
  location_id: number | null;
  location?: Location | null;
  serial_number: string | null;
  qr_code: string;
  status: AssetStatus;
  condition: AssetCondition;
  purchase_date: string | null;
  purchase_cost: number | null;
  supplier: string | null;
  notes: string | null;
  robotics_equipment_id: number | null;
  robotics_equipment?: RoboticsEquipmentRef | null;
  active_assignment?: AssetAssignment | null;
  assignments_count?: number;
  maintenance_count?: number;
  open_maintenance_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AssetMaintenanceRecord {
  id: number;
  asset_id: number;
  asset?: Asset | null;
  maintenance_date: string;
  description: string;
  status: MaintenanceStatus;
  cost: number | null;
  resolved_at: string | null;
  note: string | null;
  reported_by?: { id: string; name: string } | null;
  created_at?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category_id: number;
  category?: AssetCategory | null;
  location_id: number | null;
  location?: Location | null;
  quantity: number;
  unit: string;
  reorder_level: number;
  unit_cost: number | null;
  supplier: string | null;
  notes: string | null;
  is_active: boolean;
  is_low_stock: boolean;
  movements_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StockMovement {
  id: number;
  inventory_item_id: number;
  item?: InventoryItem | null;
  type: StockMovementType;
  quantity: number;
  reference: string | null;
  note: string | null;
  user?: { id: string; name: string } | null;
  created_at?: string;
}

export interface InventorySummary {
  total_assets: number;
  available_assets: number;
  assigned_assets: number;
  in_maintenance_assets: number;
  disposed_assets: number;
  total_stock_items: number;
  total_stock_units: number;
  low_stock_items: number;
  open_maintenance: number;
  categories: number;
  locations: number;
  assets_by_status: Record<string, number>;
  assets_by_category: Record<string, number>;
  stock_value: number;
}

export interface InventoryQueryParams {
  search?: string;
  category_id?: number | string;
  location_id?: number | string;
  status?: AssetStatus | 'all';
  condition?: AssetCondition | 'all';
  page?: number;
  per_page?: number;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
