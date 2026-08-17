import { useMemo } from 'react';
import { navigation, type NavEntry, type NavRole } from '@/config/navigation';
import { useAuthStore } from '@/store/authStore';

function filterEntries(
  entries: NavEntry[],
  role: NavRole | undefined,
  permissions: string[]
): NavEntry[] {
  if (!role) return [];

  const isBypassRole = role === 'admin' || role === 'super_admin';

  return entries.flatMap((entry) => {
    if (entry.roles && !entry.roles.includes(role) && !isBypassRole) return [];
    if (entry.permission && !isBypassRole && !permissions.includes(entry.permission)) return [];

    if (entry.children) {
      const children = filterEntries(entry.children, role, permissions);
      if (children.length === 0 && !entry.href) return [];
      return [{ ...entry, children }];
    }

    return [entry];
  });
}

export function useNavigation() {
  const user = useAuthStore((state) => state.user);

  return useMemo(() => {
    const role = user?.role?.name?.toLowerCase() as NavRole | undefined;
    const permissions = user?.role?.permissions?.map((p) => p.codename) ?? [];

    return {
      navigation: filterEntries(navigation, role, permissions),
      role,
    };
  }, [user]);
}
