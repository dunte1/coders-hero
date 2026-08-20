import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Zap,
} from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { getSetting } from '@/types/website';

const socialIcons = [
  { key: 'facebook', icon: Facebook },
  { key: 'instagram', icon: Instagram },
  { key: 'youtube', icon: Youtube },
  { key: 'linkedin', icon: Linkedin },
  { key: 'whatsapp', icon: MessageCircle },
] as const;

const quickLinks = [
  { label: 'Programs', href: '/programs' },
  { label: 'Robotics', href: '/robotics' },
  { label: 'Coding', href: '/coding' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact', href: '/contact' },
];

export function Footer() {
  const { data } = useQuery({ queryKey: ['website', 'site'], queryFn: websiteApi.site.get });

  const settings = data?.settings;
  const siteName = getSetting(settings, 'general.site_name', "Coder's Hero");
  const tagline = getSetting(settings, 'general.tagline');
  const phone = getSetting(settings, 'general.phone');
  const email = getSetting(settings, 'general.email');
  const address = getSetting(settings, 'general.address');
  const hours = getSetting(settings, 'general.hours');
  const logo = getSetting(settings, 'branding.logo');
  const logoWide = getSetting(settings, 'branding.logo_wide');
  const footerLogo = logoWide || logo;

  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              {footerLogo ? (
                <img src={footerLogo} alt={siteName} className="h-[50px] max-w-[200px] rounded object-contain" />
              ) : logo ? (
                <img src={logo} alt={siteName} className="h-[50px] w-[50px] rounded object-contain" />
              ) : (
                <Zap className="h-10 w-10 text-brand-400" />
              )}
              {!footerLogo && (
                <span className="font-display text-lg font-bold text-white">{siteName}</span>
              )}
            </Link>
            <p className="text-sm text-slate-400">{tagline}</p>
            <div className="flex items-center gap-2">
              {socialIcons.map(({ key, icon: Icon }) => {
                const url = getSetting(settings, `social.${key}`);
                if (!url) return null;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={key}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-brand-500 hover:text-slate-900"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100">
              Programs
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/programs" className="text-sm text-slate-400 hover:text-white">
                  Coding Programs
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-sm text-slate-400 hover:text-white">
                  Robotics Programs
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-sm text-slate-400 hover:text-white">
                  STEM Programs
                </Link>
              </li>
              <li>
                <Link to="/robotics" className="text-sm text-slate-400 hover:text-white">
                  Robotics Lab
                </Link>
              </li>
              <li>
                <Link to="/coding" className="text-sm text-slate-400 hover:text-white">
                  Coding Classes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {address ? (
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                  <span>{address}</span>
                </li>
              ) : null}
              {phone ? (
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-brand-400" />
                  <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="hover:text-white">
                    {phone}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-brand-400" />
                  <a href={`mailto:${email}`} className="hover:text-white">
                    {email}
                  </a>
                </li>
              ) : null}
              {hours ? (
                <li className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                  <span>{hours}</span>
                </li>
              ) : null}
              <li className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 shrink-0 text-green-400" />
                <a
                  href="https://wa.me/254793474747?text=Hi%20Coder's%20Hero%2C%20I'm%20interested%20in%20your%20programs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
