import { useEffect, useState, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu, Zap, X, Phone, ChevronDown, LogIn } from 'lucide-react';
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
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors duration-150',
          open ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'
        )}
      >
        {group.label}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      <div
        className={cn(
          'absolute left-0 top-full z-50 mt-1 w-[240px] overflow-hidden rounded-[12px] border border-white/10 bg-[#0a1f27] p-1.5 shadow-xl',
          'transition-all duration-200 origin-top-left',
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
        )}
      >
        {group.items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className="flex h-[42px] items-center rounded-lg px-3 text-[14px] font-medium text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white"
            onClick={() => setOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 lg:hidden transition-opacity duration-300',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      <nav
        className={cn(
          'absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-[#05141A] shadow-2xl',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="font-display text-lg font-bold text-white">Menu</span>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 transition-colors duration-150"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-3 py-4">
          <NavLink
            to="/"
            onClick={onClose}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-150"
          >
            Home
          </NavLink>

          {navGroups.map((group) => {
            const isExpanded = expandedGroup === group.label;
            return (
              <div key={group.label}>
                <button
                  onClick={() => setExpandedGroup(isExpanded ? null : group.label)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-150"
                >
                  {group.label}
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </button>

                <div
                  className={cn(
                    'overflow-hidden transition-all duration-200',
                    isExpanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="ml-3 border-l-2 border-white/10 pl-3 py-1">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        onClick={onClose}
                        className="block rounded-lg px-3 py-2 text-sm text-white/50 hover:bg-white/10 hover:text-white transition-colors duration-150"
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="mt-4 border-t border-white/10 pt-4 space-y-2">
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-150"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={onClose}
              className="block rounded-lg bg-brand-500 px-4 py-2.5 text-center text-sm font-semibold text-slate-900 hover:bg-brand-400 transition-colors duration-150"
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
  const logoWide = getSetting(data?.settings, 'branding.logo_wide');
  const headerLogo = logoWide || logo;

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
    <>
      <header
        className={cn(
          'sticky top-0 z-40 transition-all duration-300',
          scrolled
            ? 'border-b border-white/10 shadow-sm backdrop-blur-xl'
            : 'border-b border-transparent backdrop-blur-none'
        )}
        style={{ backgroundColor: scrolled ? 'rgba(5,20,26,0.85)' : '#05141A' }}
      >
        <div className="mx-auto flex h-[90px] max-w-7xl items-center justify-between gap-4 px-[18px] sm:h-[90px] sm:px-6 lg:h-[90px] lg:px-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="flex h-[70px] items-center justify-center rounded-xl px-2 text-brand-400 transition-shadow duration-200 group-hover:shadow-md group-hover:shadow-brand-500/20 lg:h-[80px] lg:px-2.5">
              {headerLogo ? (
                <img src={headerLogo} alt={siteName} className="h-[60px] max-w-[200px] rounded object-contain lg:h-[70px] lg:max-w-[240px]" />
              ) : logo ? (
                <img src={logo} alt={siteName} className="h-[60px] w-[60px] rounded object-contain" />
              ) : (
                <Zap className="h-5 w-5" />
              )}
            </span>
            {!headerLogo && (
              <span className="font-display text-lg font-bold tracking-tight text-white">
                {siteName}
              </span>
            )}
          </Link>

          <nav className="hidden items-center gap-[22px] lg:flex" role="navigation" aria-label="Main navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-[14px] font-medium transition-colors duration-150',
                  isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
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
                className="hidden items-center gap-1.5 text-sm font-medium text-white/50 transition-colors duration-150 hover:text-white xl:flex"
              >
                <Phone className="h-4 w-4" />
                {phone}
              </a>
            ) : null}
            <Link
              to="/login"
              className="inline-flex h-[42px] items-center rounded-lg border border-white/20 px-4 text-[14px] font-medium text-white transition-all duration-150 hover:bg-white/10 hover:text-white"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex h-[42px] items-center rounded-lg bg-brand-500 px-5 text-[14px] font-semibold text-slate-900 shadow-sm shadow-brand-500/20 transition-all duration-150 hover:bg-brand-400 hover:shadow-md hover:shadow-brand-500/30"
            >
              Enroll Now
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors duration-150 hover:bg-white/10 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
