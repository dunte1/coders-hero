import { useEffect, useState, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu, Rocket, X, Phone, ChevronDown, LogIn } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { getSetting } from '@/types/website';
import { cn } from '@/lib/utils';

interface NavLinkItem {
  label: string;
  href: string;
}

interface NavGroup {
  label: string;
  items: NavLinkItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Learn',
    items: [
      { label: 'Programs', href: '/programs' },
      { label: 'Courses', href: '/courses-catalog' },
      { label: 'Robotics Lab', href: '/robotics' },
      { label: 'Coding Classes', href: '/coding' },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Events', href: '/events' },
      { label: 'Partnerships', href: '/school-partnerships' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    label: 'Support',
    items: [
      { label: 'FAQs', href: '/faqs' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
];

function DesktopDropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          open ? 'text-brand-700' : 'text-slate-600 hover:text-slate-900'
        )}
      >
        {group.label}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
          {group.items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <nav className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <span className="font-display text-lg font-bold text-slate-900">Menu</span>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-3 py-4">
          <NavLink to="/" onClick={onClose} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Home
          </NavLink>
          {navGroups.map((group) => (
            <div key={group.label}>
              <button
                onClick={() => setExpandedGroup(expandedGroup === group.label ? null : group.label)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {group.label}
                <ChevronDown className={cn('h-4 w-4 transition-transform', expandedGroup === group.label && 'rotate-180')} />
              </button>
              {expandedGroup === group.label && (
                <div className="ml-3 border-l-2 border-slate-100 pl-3">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={onClose}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-700"
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="mt-4 border-t border-slate-100 pt-4 space-y-2">
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={onClose}
              className="block rounded-lg bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
            >
              Enroll Now
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data } = useQuery({ queryKey: ['website', 'site'], queryFn: websiteApi.site.get });

  const siteName = getSetting(data?.settings, 'general.site_name', "Coder's Hero");
  const phone = getSetting(data?.settings, 'general.phone');
  const logo = getSetting(data?.settings, 'branding.logo');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled
          ? 'border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl'
          : 'border-b border-transparent bg-white/80 backdrop-blur-md'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-sm transition-shadow group-hover:shadow-md group-hover:shadow-brand-500/20">
            {logo ? (
              <img src={logo} alt={siteName} className="h-5 w-5 rounded object-contain" />
            ) : (
              <Rocket className="h-5 w-5" />
            )}
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">
            {siteName}
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" role="navigation" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )
            }
          >
            Home
          </NavLink>
          {navGroups.map((group) => (
            <DesktopDropdown key={group.label} group={group} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^+\d]/g, '')}`}
              className="hidden items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600 xl:flex"
            >
              <Phone className="h-4 w-4" />
              {phone}
            </a>
          ) : null}
          <Link
            to="/login"
            className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/20"
          >
            Enroll Now
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
