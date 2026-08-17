import { GraduationCap, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useNavigation } from '@/hooks/useNavigation';
import { useSiteBranding } from '@/hooks/usePublicSiteSettings';
import { SidebarItem } from './SidebarItem';
import { SidebarGroup } from './SidebarGroup';
import { cn } from '@/lib/utils';
import { Button } from '../ui/Button';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const { navigation } = useNavigation();
  const { siteName, logo } = useSiteBranding();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 lg:translate-x-0 lg:static lg:z-auto',
          sidebarCollapsed ? 'w-[68px]' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-text)' }}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4" style={{ borderBottom: '1px solid var(--header-border)' }}>
          {sidebarCollapsed ? (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--sidebar-active)' }}>
              {logo ? (
                <img src={logo} alt={siteName} className="h-5 w-5 rounded object-contain" />
              ) : (
                <GraduationCap className="h-5 w-5" style={{ color: 'var(--sidebar-active-text)' }} />
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--sidebar-active)' }}>
                  {logo ? (
                    <img src={logo} alt={siteName} className="h-5 w-5 rounded object-contain" />
                  ) : (
                    <GraduationCap className="h-5 w-5" style={{ color: 'var(--sidebar-active-text)' }} />
                  )}
                </div>
                <span className="text-lg font-bold truncate" style={{ color: 'var(--sidebar-active-text)' }}>{siteName}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                style={{ color: 'var(--sidebar-text)' }}
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className={cn('flex-1 overflow-y-auto p-3 space-y-1', sidebarCollapsed && 'px-2 pt-3')}>
          {navigation.map((entry) =>
            entry.children ? (
              <SidebarGroup key={entry.label} entry={entry} collapsed={sidebarCollapsed} />
            ) : (
              <SidebarItem
                key={entry.href ?? entry.label}
                label={entry.label}
                href={entry.href ?? '#'}
                icon={entry.icon}
                collapsed={sidebarCollapsed}
              />
            )
          )}
        </nav>

        {/* Footer */}
        <div className="p-3" style={{ borderTop: '1px solid var(--header-border)' }}>
          <div className={cn('flex items-center gap-3 rounded-lg px-3 py-2', sidebarCollapsed && 'justify-center px-2')}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-medium" style={{ backgroundColor: 'var(--sidebar-active)' }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--sidebar-active-text)' }}>
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--sidebar-text)' }}>{user?.role?.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle — desktop only */}
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          className="hidden lg:flex h-8 items-center justify-center transition-colors"
          style={{ borderTop: '1px solid var(--header-border)', color: 'var(--sidebar-text)' }}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </aside>
    </>
  );
}
