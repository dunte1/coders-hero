import type {
  RoboticsEquipmentCondition,
  RoboticsEquipmentStatus,
  RoboticsEquipmentType,
  RoboticsMaintenanceStatus,
  RoboticsMaintenanceType,
  RoboticsProjectCategory,
  RoboticsProjectStatus,
  RoboticsReservationStatus,
} from '@/types/robotics';

export const EQUIPMENT_TYPES: RoboticsEquipmentType[] = [
  'kit',
  'arduino_board',
  'lego_kit',
  'sensor',
  'microcontroller',
  'component',
];

export const EQUIPMENT_CONDITIONS: RoboticsEquipmentCondition[] = ['new', 'good', 'fair', 'poor'];

export const EQUIPMENT_STATUSES: RoboticsEquipmentStatus[] = ['active', 'retired'];

export const MAINTENANCE_TYPES: RoboticsMaintenanceType[] = [
  'repair',
  'calibration',
  'inspection',
  'cleaning',
  'replacement',
];

export const MAINTENANCE_STATUSES: RoboticsMaintenanceStatus[] = ['reported', 'in_progress', 'resolved'];

export const RESERVATION_STATUSES: RoboticsReservationStatus[] = [
  'pending',
  'approved',
  'rejected',
  'cancelled',
  'completed',
];

export const PROJECT_CATEGORIES: RoboticsProjectCategory[] = ['class', 'competition', 'personal'];

export const PROJECT_STATUSES: RoboticsProjectStatus[] = ['planning', 'in_progress', 'completed', 'archived'];

export function isRoboticsStaff(role?: string): boolean {
  return ['teacher', 'instructor', 'admin', 'super_admin'].includes(role?.toLowerCase() ?? '');
}

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
