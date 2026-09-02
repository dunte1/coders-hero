import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CopyrightFooter } from '@/components/ui/CopyrightFooter';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-slate-50">
      <Sidebar />
      <div
        className={cn(
          'flex h-screen flex-1 flex-col overflow-hidden lg:transition-[padding-left] lg:duration-300',
          sidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-56'
        )}
      >
        <Header />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
        <CopyrightFooter />
      </div>
    </div>
  );
}
