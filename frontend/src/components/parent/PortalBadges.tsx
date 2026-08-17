import { Badge } from '@/components/ui/Badge';
import type { AppointmentStatus, PortalAttendanceStatus, PortalFeeStatus } from '@/types/portal';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

const FEE_STATUS_VARIANT: Record<PortalFeeStatus, BadgeVariant> = {
  pending: 'warning',
  paid: 'success',
  waived: 'secondary',
};

const APPOINTMENT_STATUS_VARIANT: Record<AppointmentStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'default',
  completed: 'success',
  cancelled: 'secondary',
};

const ATTENDANCE_STATUS_VARIANT: Record<PortalAttendanceStatus, BadgeVariant> = {
  present: 'success',
  late: 'warning',
  absent: 'destructive',
  excused: 'secondary',
};

export function capitalize(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function FeeStatusBadge({ status }: { status: PortalFeeStatus }) {
  return <Badge variant={FEE_STATUS_VARIANT[status]}>{capitalize(status)}</Badge>;
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge variant={APPOINTMENT_STATUS_VARIANT[status]}>{capitalize(status)}</Badge>;
}

export function PortalAttendanceStatusBadge({ status }: { status: PortalAttendanceStatus }) {
  return <Badge variant={ATTENDANCE_STATUS_VARIANT[status]}>{capitalize(status)}</Badge>;
}

export const FEE_STATUSES: PortalFeeStatus[] = ['pending', 'paid', 'waived'];

export const APPOINTMENT_STATUSES: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

export const PAYMENT_METHODS = ['cash', 'card', 'bank_transfer', 'online'] as const;
