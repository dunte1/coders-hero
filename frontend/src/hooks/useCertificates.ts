import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { certificatesApi, getErrorMessage } from '@/lib/certificatesApi';
import type { CertificateQueryParams } from '@/types/certificates';

export function useMyCertificates(params?: CertificateQueryParams) {
  return useQuery({ queryKey: ['certificates', 'my', params], queryFn: () => certificatesApi.myCertificates(params) });
}

export function useCertificate(id: number) {
  return useQuery({ queryKey: ['certificates', 'item', id], queryFn: () => certificatesApi.certificate(id), enabled: !!id });
}

export function useAllCertificates(params?: CertificateQueryParams) {
  return useQuery({ queryKey: ['certificates', 'admin', params], queryFn: () => certificatesApi.allCertificates(params) });
}

export function useCertificateSummary() {
  return useQuery({ queryKey: ['certificates', 'summary'], queryFn: () => certificatesApi.summary() });
}

export function useVerifications(params?: CertificateQueryParams) {
  return useQuery({ queryKey: ['certificates', 'verifications', params], queryFn: () => certificatesApi.verifications(params) });
}

export function useTemplates(params?: CertificateQueryParams) {
  return useQuery({ queryKey: ['certificates', 'templates', params], queryFn: () => certificatesApi.templates(params) });
}

export function useTemplateOptions() {
  return useQuery({ queryKey: ['certificates', 'templates', 'options'], queryFn: () => certificatesApi.templateOptions() });
}

export function useIssueCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollmentId, templateId, badgeName, badgeColor }: { enrollmentId: number; templateId?: number | null; badgeName?: string | null; badgeColor?: string | null }) =>
      certificatesApi.issue(enrollmentId, templateId, badgeName, badgeColor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Certificate issued');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useBulkGenerate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, templateId, badgeName, badgeColor }: { courseId: number; templateId?: number | null; badgeName?: string | null; badgeColor?: string | null }) =>
      certificatesApi.bulkGenerate(courseId, templateId, badgeName, badgeColor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Bulk generation completed');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useRevokeCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string | null }) => certificatesApi.revoke(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Certificate revoked');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUnrevokeCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => certificatesApi.unrevoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Certificate reinstated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: certificatesApi.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates', 'templates'] });
      toast.success('Template created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Parameters<typeof certificatesApi.updateTemplate>[1]> }) =>
      certificatesApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates', 'templates'] });
      toast.success('Template updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => certificatesApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates', 'templates'] });
      toast.success('Template deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}
