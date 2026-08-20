import { Bell, Menu, LogOut, User, Settings } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';
import { Button } from '../ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import { useNavigate } from 'react-router-dom';
import { useNotificationStats } from '@/hooks/useNotifications';
import { getInitials } from '@/lib/utils';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function Header() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const { toggleSidebar, breadcrumbs } = useUIStore();
  const navigate = useNavigate();

  const { data: notifStats } = useNotificationStats();

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 px-4 lg:px-6" style={{ backgroundColor: 'var(--header-bg)', borderBottom: '1px solid var(--header-border)' }}>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden sm:flex items-center text-sm">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && <span className="mx-1 text-slate-400">/</span>}
                {crumb.href ? (
                  <button
                    onClick={() => navigate(crumb.href!)}
                    className="text-slate-500 hover:text-brand-600"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-slate-900 font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Welcome message */}
      <div className="flex flex-1 items-center">
        <div className="hidden md:flex flex-col">
          <p className="text-sm text-slate-500">{getGreeting()} 👋</p>
          <p className="text-lg font-semibold text-slate-900">Welcome back, {displayName}!</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="h-5 w-5 text-slate-600" />
          {notifStats && notifStats.unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {notifStats.unread > 9 ? '9+' : notifStats.unread}
            </span>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>
                  {getInitials(user?.name || 'U', '')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-slate-900">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              {t('Profile')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              {t('Settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              {t('Logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
