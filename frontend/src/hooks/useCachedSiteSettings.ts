import { useQueryClient } from '@tanstack/react-query';
import { getSetting } from '@/types/website';

const SITE_QUERY_KEY = ['website', 'site'];

export function useCachedSiteName(): string {
  const qc = useQueryClient();
  const data = qc.getQueryData<{ settings?: Record<string, Record<string, string>> }>(SITE_QUERY_KEY);
  return getSetting(data?.settings, 'general.site_name', "Coder's Hero");
}

export function useCachedSiteOgImage(): string {
  const qc = useQueryClient();
  const data = qc.getQueryData<{ settings?: Record<string, Record<string, string>> }>(SITE_QUERY_KEY);
  return getSetting(data?.settings, 'seo.og_image');
}
