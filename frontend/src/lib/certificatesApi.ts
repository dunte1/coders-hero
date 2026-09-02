import api from '@/lib/axios';
import type { Page, PaginationMeta } from '@/types/cms';
import type {
  Certificate,
  CertificateQueryParams,
  CertificateSummary,
  CertificateTemplate,
  CertificateVerification,
  CertificateVerifyResult,
  TemplateInput,
} from '@/types/certificates';

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

export { getErrorMessage } from '@/lib/studentsApi';

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

export const certificatesApi = {
  // My certificates (student-facing)
  myCertificates: (params?: CertificateQueryParams) =>
    api.get<{ data: Certificate[]; meta: PaginationMeta }>('/certificates', { params }).then(unwrapPage),

  certificate: (id: number) =>
    api.get<{ data: Certificate }>(`/certificates/${id}`).then(unwrap),

  downloadUrl: (certificateNumber: string) => `/api/certificates/${certificateNumber}/download`,

  qrCode: (verificationCode: string) =>
    api.get<{ data: { qr_code_url: string } }>(`/certificates/qr/${verificationCode}`).then(unwrap),

  issue: (enrollmentId: number, templateId?: number | null, badgeName?: string | null, badgeColor?: string | null) =>
    api.post<{ data: Certificate }>(`/certificates/generate/${enrollmentId}`, {
      template_id: templateId ?? undefined,
      badge_name: badgeName ?? undefined,
      badge_color: badgeColor ?? undefined,
    }).then(unwrap),

  verify: (verificationCode: string) =>
    api.post<{ data: CertificateVerifyResult }>('/public/certificates/verify', {
      verification_code: verificationCode,
    }).then(unwrap),

  publicVerify: (verificationCode: string) =>
    api.post<{ data: CertificateVerifyResult }>('/public/certificates/verify', {
      verification_code: verificationCode,
    }).then(unwrap),

  publicQrCode: (verificationCode: string) =>
    api.get<{ data: { qr_code_url: string } }>(`/public/certificates/qr/${verificationCode}`).then(unwrap),

  // Admin management
  allCertificates: (params?: CertificateQueryParams) =>
    api.get<{ data: Certificate[]; meta: PaginationMeta }>('/admin/certificates', { params }).then(unwrapPage),

  verifications: (params?: CertificateQueryParams) =>
    api.get<{ data: CertificateVerification[]; meta: PaginationMeta }>('/admin/certificates/verifications', { params }).then(unwrapPage),

  revoke: (id: number, reason?: string | null) =>
    api.put<{ data: Certificate }>(`/admin/certificates/${id}/revoke`, { reason }).then(unwrap),

  unrevoke: (id: number) =>
    api.put<{ data: Certificate }>(`/admin/certificates/${id}/unrevoke`).then(unwrap),

  bulkGenerate: (courseId: number, templateId?: number | null, badgeName?: string | null, badgeColor?: string | null) =>
    api.post<{ data: { generated: number; skipped: number } }>('/admin/certificates/bulk-generate', {
      course_id: courseId,
      template_id: templateId ?? undefined,
      badge_name: badgeName ?? undefined,
      badge_color: badgeColor ?? undefined,
    }).then(unwrap),

  // Templates
  templates: (params?: CertificateQueryParams) =>
    api.get<{ data: CertificateTemplate[]; meta: PaginationMeta }>('/admin/certificate-templates', { params }).then(unwrapPage),

  templateOptions: () =>
    api.get<{ data: CertificateTemplate[] }>('/admin/certificate-templates/options').then(unwrap),

  template: (id: number) =>
    api.get<{ data: CertificateTemplate }>(`/admin/certificate-templates/${id}`).then(unwrap),

  createTemplate: (data: TemplateInput) =>
    api.post<{ data: CertificateTemplate }>('/admin/certificate-templates', data).then(unwrap),

  updateTemplate: (id: number, data: Partial<TemplateInput>) =>
    api.put<{ data: CertificateTemplate }>(`/admin/certificate-templates/${id}`, data).then(unwrap),

  deleteTemplate: (id: number) =>
    api.delete(`/admin/certificate-templates/${id}`).then((res) => res.data),

  // Summary
  summary: () => api.get<{ data: CertificateSummary }>('/admin/certificates-summary').then(unwrap),
};
