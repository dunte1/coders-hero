import type { Course } from '@/types/index';

/** Minimal user shape as returned by the backend UserResource (`name`). */
export interface CertificateHolder {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
}

export type CertificateStatus = 'issued' | 'revoked';

export interface Certificate {
  id: number;
  user_id: string;
  course_id: number;
  enrollment_id: number;
  template_id: number | null;
  template?: CertificateTemplate | null;
  certificate_number: string;
  issued_at: string | null;
  certificate_url: string | null;
  verification_code: string;
  qr_code: string | null;
  qr_code_url: string | null;
  digital_signature: string | null;
  status: CertificateStatus;
  is_revoked: boolean;
  revoked_at: string | null;
  revoked_reason: string | null;
  user?: CertificateHolder | null;
  course?: Course | null;
  verifications_count?: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface CertificateTemplate {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  body_html: string | null;
  accent_color: string;
  font_family: string;
  logo_url: string | null;
  signature_name: string | null;
  signature_title: string | null;
  is_default: boolean;
  is_active: boolean;
  certificates_count?: number;
  created_at: string | null;
}

export interface CertificateVerification {
  id: number;
  certificate_id: number;
  certificate?: Certificate | null;
  verifier_ip: string | null;
  verified_at: string | null;
  outcome: 'valid' | 'revoked';
  created_at: string | null;
}

export interface CertificateVerifyResult {
  valid: boolean;
  revoked: boolean;
  revoked_reason: string | null;
  certificate_number: string;
  holder_name: string | null;
  course: string | null;
  issued_at: string | null;
  template_name: string | null;
  verification_count: number;
}

export interface CertificateSummary {
  total_certificates: number;
  issued_certificates: number;
  revoked_certificates: number;
  total_templates: number;
  active_templates: number;
  total_verifications: number;
  recent_verifications: CertificateVerification[];
}

export interface CertificateQueryParams {
  page?: number;
  per_page?: number;
  status?: string;
  course_id?: number;
  search?: string;
  outcome?: string;
}

export interface TemplateInput {
  name: string;
  description?: string | null;
  body_html?: string | null;
  accent_color?: string;
  font_family?: string;
  signature_name?: string | null;
  signature_title?: string | null;
  is_default?: boolean;
  is_active?: boolean;
}
