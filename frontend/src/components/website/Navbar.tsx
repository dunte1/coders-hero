import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu, Rocket, X, Phone } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { getSetting } from '@/types/website';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Programs', href: '/programs' },
  { label: 'Robotics', href: '/robotics' },
  { label: 'Coding', href: '/coding' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { data } = useQuery({ queryKey: ['website', 'site'], queryFn: websiteApi.site.get });

  const siteName = getSetting(data?.settings, 'general.site_name', "Coder's Hero");
  const phone = getSetting(data?.settings, 'general.phone');
  const logo = getSetting(data?.settings, 'branding.logo');

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-sm">
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

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-brand-700',
                  isActive && 'bg-brand-50 text-brand-700'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^+\d]/g, '')}`}
              className="hidden items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-700 xl:flex"
            >
              <Phone className="h-4 w-4" />
              {phone}
            </a>
          ) : null}
          <Link
            to="/contact"
            className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            Enroll Now
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 lg:hidden">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50',
                  isActive && 'bg-brand-50 text-brand-700'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-lg bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
          >
            Enroll Now
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
