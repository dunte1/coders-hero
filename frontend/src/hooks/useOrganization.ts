import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { branchesApi, partnerSchoolsApi, academicYearsApi } from '@/lib/organizationApi';
import type { BranchInput, PartnerSchoolInput, AcademicYearInput } from '@/lib/organizationApi';

function getErrorMessage(err: unknown): string {
  const error = err as { response?: { data?: { message?: string } } };
  return error.response?.data?.message || 'Something went wrong';
}

// ── Branches ──────────────────────────────────────────────────────────────

export function useBranches(params?: { page?: number; per_page?: number; search?: string; is_active?: boolean }) {
  return useQuery({
    queryKey: ['branches', params],
    queryFn: () => branchesApi.list(params),
  });
}

export function useBranchOptions() {
  return useQuery({
    queryKey: ['branches', 'all'],
    queryFn: branchesApi.all,
  });
}

export function useBranch(id: number) {
  return useQuery({
    queryKey: ['branches', id],
    queryFn: () => branchesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BranchInput) => branchesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); toast.success('Branch created'); },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BranchInput> }) => branchesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); toast.success('Branch updated'); },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => branchesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); toast.success('Branch deleted'); },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

// ── Partner Schools ───────────────────────────────────────────────────────

export function usePartnerSchools(params?: { page?: number; per_page?: number; search?: string; partnership_type?: string; is_active?: boolean }) {
  return useQuery({
    queryKey: ['partner-schools', params],
    queryFn: () => partnerSchoolsApi.list(params),
  });
}

export function usePartnerSchoolOptions() {
  return useQuery({
    queryKey: ['partner-schools', 'all'],
    queryFn: partnerSchoolsApi.all,
  });
}

export function usePartnerSchool(id: number) {
  return useQuery({
    queryKey: ['partner-schools', id],
    queryFn: () => partnerSchoolsApi.get(id),
    enabled: !!id,
  });
}

export function useCreatePartnerSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PartnerSchoolInput) => partnerSchoolsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['partner-schools'] }); toast.success('Partner school created'); },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdatePartnerSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PartnerSchoolInput> }) => partnerSchoolsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['partner-schools'] }); toast.success('Partner school updated'); },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

export function useDeletePartnerSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => partnerSchoolsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['partner-schools'] }); toast.success('Partner school deleted'); },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

// ── Academic Years ────────────────────────────────────────────────────────

export function useAcademicYears(params?: { page?: number; per_page?: number; search?: string; is_current?: boolean }) {
  return useQuery({
    queryKey: ['academic-years', params],
    queryFn: () => academicYearsApi.list(params),
  });
}

export function useCurrentAcademicYear() {
  return useQuery({
    queryKey: ['academic-years', 'current'],
    queryFn: academicYearsApi.current,
    retry: false,
  });
}

export function useAcademicYear(id: number) {
  return useQuery({
    queryKey: ['academic-years', id],
    queryFn: () => academicYearsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateAcademicYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AcademicYearInput) => academicYearsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['academic-years'] }); toast.success('Academic year created'); },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateAcademicYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AcademicYearInput> }) => academicYearsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['academic-years'] }); toast.success('Academic year updated'); },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteAcademicYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => academicYearsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['academic-years'] }); toast.success('Academic year deleted'); },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

export function useSetCurrentAcademicYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => academicYearsApi.setCurrent(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['academic-years'] }); toast.success('Current academic year updated'); },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}
