import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '@/i18n';
import type { NavEntry } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { SidebarItem } from './SidebarItem';

interface SidebarGroupProps {
  entry: NavEntry;
  collapsed?: boolean;
  defaultOpen?: boolean;
}

function isEntryActive(entry: NavEntry, pathname: string): boolean {
  if (entry.href && pathname === entry.href) return true;
  if (entry.href && entry.children && pathname.startsWith(entry.href + '/')) return true;
  return entry.children?.some((child) => isEntryActive(child, pathname)) ?? false;
}

export function SidebarGroup({ entry, collapsed, defaultOpen }: SidebarGroupProps) {
  const location = useLocation();
  const { t } = useI18n();
  const children = entry.children ?? [];
  const isActive = isEntryActive(entry, location.pathname);
  const [open, setOpen] = useState(defaultOpen ?? isActive);
  const translatedLabel = t(entry.label);

  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  if (collapsed) {
    return (
      <div className="relative group/nav" title={translatedLabel}>
        <div
          className="flex items-center justify-center rounded-lg px-2 py-2.5 transition-colors"
          style={{ color: 'var(--sidebar-text)' }}
        >
          {entry.icon && <entry.icon className="h-5 w-5 shrink-0" />}
        </div>
        <div className="absolute left-full top-0 z-50 hidden min-w-48 rounded-lg border border-slate-700 bg-slate-800 p-2 shadow-xl group-hover/nav:block">
          <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {translatedLabel}
          </p>
          {children.map((child) => (
            <SidebarItem key={child.href ?? child.label} label={child.label} href={child.href ?? '#'} icon={child.icon} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        style={{
          backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : undefined,
          color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
        }}
        aria-expanded={open}
      >
        {entry.icon && (
          <entry.icon
            className="h-5 w-5 shrink-0"
            style={{ color: isActive ? 'var(--sidebar-active)' : 'var(--sidebar-text)' }}
          />
        )}
        <span className="flex-1 text-left">{translatedLabel}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')}
          style={{ color: 'var(--sidebar-text)' }}
        />
      </button>

      {open && (
        <div className="mt-1 space-y-1 pl-4">
          {children.map((child) => (
            <SidebarItem key={child.href ?? child.label} label={child.label} href={child.href ?? '#'} icon={child.icon} />
          ))}
        </div>
      )}
    </div>
  );
}
