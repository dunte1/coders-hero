import { Badge } from '@/components/ui/Badge';
import type { AdmissionStatus, AttendanceStatus, StudentStatus } from '@/types/students';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

const STUDENT_STATUS_VARIANT: Record<StudentStatus, BadgeVariant> = {
  pending: 'warning',
  active: 'success',
  suspended: 'warning',
  withdrawn: 'secondary',
  transferred: 'default',
  graduated: 'default',
};

const ADMISSION_STATUS_VARIANT: Record<AdmissionStatus, BadgeVariant> = {
  new: 'secondary',
  in_review: 'default',
  approved: 'success',
  admitted: 'success',
  rejected: 'destructive',
};

const ATTENDANCE_STATUS_VARIANT: Record<AttendanceStatus, BadgeVariant> = {
  present: 'success',
  late: 'warning',
  absent: 'destructive',
  excused: 'secondary',
};

function capitalize(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  return <Badge variant={STUDENT_STATUS_VARIANT[status]}>{capitalize(status)}</Badge>;
}

export function AdmissionStatusBadge({ status }: { status: AdmissionStatus }) {
  return <Badge variant={ADMISSION_STATUS_VARIANT[status]}>{capitalize(status)}</Badge>;
}

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  return <Badge variant={ATTENDANCE_STATUS_VARIANT[status]}>{capitalize(status)}</Badge>;
}

export const STUDENT_STATUSES: StudentStatus[] = [
  'pending',
  'active',
  'suspended',
  'withdrawn',
  'transferred',
  'graduated',
];

export const ADMISSION_STATUSES: AdmissionStatus[] = ['new', 'in_review', 'approved', 'admitted', 'rejected'];

export const ATTENDANCE_STATUSES: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

export const DOCUMENT_TYPES = ['birth_certificate', 'id_card', 'report_card', 'medical', 'consent_form', 'other'];

export const TIMELINE_EVENT_TYPES = [
  'admission',
  'promotion',
  'transfer',
  'graduation',
  'suspension',
  'achievement',
  'note',
  'other',
];
