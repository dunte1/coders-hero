export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern';

export type EmployeeStatus = 'active' | 'on_leave' | 'terminated' | 'resigned';

export type ContractType = 'permanent' | 'fixed_term' | 'contract' | 'intern';

export type ContractStatus = 'active' | 'expired' | 'terminated' | 'superseded';

export type LeaveType = 'annual' | 'sick' | 'maternity' | 'paternity' | 'study' | 'unpaid' | 'compassionate';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'leave';

export type PayrollStatus = 'draft' | 'processed' | 'paid' | 'cancelled';

export type PayslipStatus = 'pending' | 'paid' | 'cancelled';

export type ReviewStatus = 'draft' | 'submitted' | 'acknowledged';

export type DocumentCategory = 'contract' | 'national_id' | 'certificate' | 'degree' | 'payslip' | 'other';

export interface HrUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  phone: string | null;
  initials: string | null;
  is_active: boolean;
  roles?: { id: number; name: string; display_name?: string }[];
}

export interface Department {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  manager_id: string | null;
  parent_id: number | null;
  is_active: boolean;
  employees_count?: number;
  positions_count?: number;
}

export interface Position {
  id: number;
  name: string;
  department_id: number | null;
  level: string | null;
  description: string | null;
  is_active: boolean;
  department?: Department | null;
  employees_count?: number;
}

export interface EmployeeContract {
  id: number;
  employee_id: number;
  contract_no: string | null;
  type: ContractType;
  start_date: string;
  end_date: string | null;
  salary: number | null;
  status: ContractStatus;
  signed_on: string | null;
  notes: string | null;
  created_by_user_id: string | null;
  employee?: EmployeeLite | null;
  created_by?: HrUser | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeContractInput {
  employee_id: number;
  contract_no?: string | null;
  type: ContractType;
  start_date: string;
  end_date?: string | null;
  salary?: number | null;
  status?: ContractStatus;
  signed_on?: string | null;
  notes?: string | null;
}

export interface EmployeeHr {
  id: number;
  user_id: string;
  employee_id: string;
  department_id: number | null;
  position_id: number | null;
  hire_date: string | null;
  employment_type: EmploymentType;
  salary: number | null;
  status: EmployeeStatus;
  tenure: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  national_id: string | null;
  address: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  user: HrUser | null;
  department: Department | null;
  position: Position | null;
  active_contract: EmployeeContract | null;
  contracts_count?: number;
  leaves_count?: number;
  payslips_count?: number;
  documents_count?: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeeHrInput {
  department_id?: number | null;
  position_id?: number | null;
  hire_date?: string | null;
  employment_type?: EmploymentType | null;
  salary?: number | null;
  date_of_birth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  national_id?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  status?: EmployeeStatus | null;
}

export interface EmployeeLite {
  id: number;
  user_id: string;
  employee_id: string;
  department_id: number | null;
  position_id: number | null;
  hire_date: string;
  employment_type: EmploymentType;
  salary: number | null;
  status: EmployeeStatus;
  tenure: string | null;
  user?: HrUser | null;
  department?: Department | null;
  position?: Position | null;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days: number;
  reason: string | null;
  status: LeaveStatus;
  requested_by_user_id: string | null;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  employee?: EmployeeLite | null;
  requested_by?: HrUser | null;
  reviewed_by?: HrUser | null;
  created_at: string;
}

export interface LeaveRequestInput {
  employee_id?: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason?: string | null;
}

export interface LeaveBalance {
  allowance: number;
  used: number;
  remaining: number;
}

export interface StaffAttendance {
  id: number;
  employee_id: number;
  attendance_date: string;
  status: AttendanceStatus;
  check_in: string | null;
  check_out: string | null;
  note: string | null;
  recorded_by_user_id: string | null;
  employee?: EmployeeLite | null;
  recorded_by?: HrUser | null;
  created_at: string;
}

export interface StaffAttendanceInput {
  employee_id?: number;
  attendance_date: string;
  status: AttendanceStatus;
  check_in?: string | null;
  check_out?: string | null;
  note?: string | null;
}

export interface Payroll {
  id: number;
  payroll_no: string;
  month: string;
  status: PayrollStatus;
  gross_total: number;
  deductions_total: number;
  net_total: number;
  processed_by_user_id: string | null;
  processed_at: string | null;
  employees_count?: number;
  payslips?: Payslip[] | null;
  processed_by?: HrUser | null;
  created_at: string;
}

export interface Payslip {
  id: number;
  payroll_id: number;
  employee_id: number;
  gross_amount: number;
  deductions_amount: number;
  net_amount: number;
  deductions_breakdown: Record<string, number> | null;
  allowances_breakdown: Record<string, number> | null;
  status: PayslipStatus;
  payment_method: string | null;
  paid_at: string | null;
  employee?: EmployeeLite | null;
  payroll?: Payroll | null;
  created_at: string;
}

export interface PerformanceReview {
  id: number;
  employee_id: number;
  reviewer_user_id: string | null;
  review_period: string | null;
  review_date: string;
  rating: number | null;
  goals: string | null;
  achievements: string | null;
  areas_to_improve: string | null;
  feedback: string | null;
  status: ReviewStatus;
  employee?: EmployeeLite | null;
  reviewer?: HrUser | null;
  created_at: string;
  updated_at: string;
}

export interface PerformanceReviewInput {
  employee_id?: number;
  reviewer_user_id?: string | null;
  review_period?: string | null;
  review_date: string;
  rating?: number | null;
  goals?: string | null;
  achievements?: string | null;
  areas_to_improve?: string | null;
  feedback?: string | null;
  status?: ReviewStatus;
}

export interface EmployeeDocument {
  id: number;
  employee_id: number;
  title: string;
  category: DocumentCategory;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  size: number | null;
  size_human: string | null;
  uploaded_by_user_id: string | null;
  employee?: EmployeeLite | null;
  uploaded_by?: HrUser | null;
  created_at: string;
}

export interface HrSummary {
  total_employees: number;
  active_employees: number;
  on_leave_employees: number;
  terminated_employees: number;
  departments: number;
  active_contracts: number;
  pending_leave_requests: number;
  approved_leave_this_month: number;
  attendance_today: { present: number; absent: number; late: number; half_day: number; leave: number };
  recorded_today: number;
  current_payroll: {
    payroll_no: string;
    month: string;
    status: PayrollStatus;
    net_total: number;
    employees: number;
  } | null;
  average_review_rating: number;
}

export interface MyHrSummary {
  employee_id: number;
  status: EmployeeStatus;
  annual_leave_used: number;
  annual_leave_remaining: number;
  pending_leave_requests: number;
  approved_leave_days: number;
  attendance_this_month: { present: number; absent: number; late: number };
  latest_payslip: {
    payroll_no: string;
    month: string;
    gross_amount: number;
    deductions_amount: number;
    net_amount: number;
    status: PayslipStatus;
  } | null;
}

export interface HeadcountReport {
  total: number;
  by_department: Record<string, number>;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  departments: { id: number; name: string; employees_count: number }[];
}

export interface LeaveReport {
  total_requests: number;
  approved_days: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
}

export interface AttendanceReportRow {
  employee_id: number;
  employee_code: string;
  employee_name: string;
  department: string;
  present: number;
  absent: number;
  late: number;
  half_day: number;
  leave: number;
  total: number;
  rate: number;
}

export interface AttendanceReport {
  from: string;
  to: string;
  staff: AttendanceReportRow[];
}

export interface PayrollReportRow {
  id: number;
  payroll_no: string;
  month: string;
  status: PayrollStatus;
  gross_total: number;
  deductions_total: number;
  net_total: number;
  employees: number;
}

export interface PayrollReport {
  payrolls: PayrollReportRow[];
  totals: { gross: number; deductions: number; net: number };
}

export const LEAVE_TYPES: LeaveType[] = ['annual', 'sick', 'maternity', 'paternity', 'study', 'unpaid', 'compassionate'];

export const ATTENDANCE_STATUSES: AttendanceStatus[] = ['present', 'absent', 'late', 'half_day', 'leave'];

export const DOCUMENT_CATEGORIES: DocumentCategory[] = ['contract', 'national_id', 'certificate', 'degree', 'payslip', 'other'];

export const CONTRACT_TYPES: ContractType[] = ['permanent', 'fixed_term', 'contract', 'intern'];

export const EMPLOYMENT_TYPES: EmploymentType[] = ['full_time', 'part_time', 'contract', 'intern'];

export const EMPLOYEE_STATUSES: EmployeeStatus[] = ['active', 'on_leave', 'terminated', 'resigned'];
