import { useSiteName } from '@/hooks/usePublicSiteSettings';

export function CopyrightFooter() {
  const systemName = useSiteName();

  return (
    <footer className="py-4 text-center text-xs text-slate-500">
      © 2026 {systemName}. Developed by Duncoweb Solutions. All rights reserved.
    </footer>
  );
}
