import { useEffect } from 'react';
import { websiteApi } from '@/lib/websiteApi';

export function usePageView(path?: string) {
  useEffect(() => {
    const currentPath = path ?? window.location.pathname;
    websiteApi.pageViews.record(currentPath).catch(() => undefined);
  }, [path]);
}
