import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cmsApi, getErrorMessage } from '@/lib/cmsApi';
import type { SiteSetting } from '@/types/cms';

export interface SiteSettingsPayload {
  settings: SiteSetting[];
  groups: string[];
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: cmsApi.siteSettings.get,
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: { key: string; value: string; group: string }[]) =>
      cmsApi.siteSettings.update(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Settings saved successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useSettingsGroup(group: string) {
  const { data, ...rest } = useSiteSettings();
  return {
    data: data?.settings.filter((s) => s.group === group) ?? [],
    groups: data?.groups ?? [],
    ...rest,
  };
}
