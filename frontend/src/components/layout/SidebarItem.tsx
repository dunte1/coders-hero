import { Link, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  label: string;
  href: string;
  icon?: LucideIcon;
  collapsed?: boolean;
  badge?: number;
}

export function SidebarItem({ label, href, icon: Icon, collapsed, badge }: SidebarItemProps) {
  const location = useLocation();
  const { t } = useI18n();
  const isActive = location.pathname === href;
  const translated = t(label);

  return (
    <Link
      to={href}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        collapsed && 'justify-center px-2'
      )}
      style={{
        backgroundColor: isActive ? 'var(--sidebar-active)' : undefined,
        color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
      }}
      title={collapsed ? translated : undefined}
    >
      {Icon && (
        <Icon
          className="h-5 w-5 shrink-0"
          style={{ color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)' }}
        />
      )}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{translated}</span>
          {badge !== undefined && badge > 0 && (
            <span
              className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium"
              style={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--sidebar-active)',
                color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-active-text)',
              }}
            >
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
