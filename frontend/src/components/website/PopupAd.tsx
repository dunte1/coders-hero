import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { getSetting } from '@/types/website';

const DISMISS_KEY = 'ch_popup_dismissed';

export function PopupAd() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { data } = useQuery({ queryKey: ['website', 'site'], queryFn: websiteApi.site.get });
  const settings = data?.settings;

  const enabled = getSetting(settings, 'popup.enabled', '1') !== '0';
  const title = getSetting(settings, 'popup.title', '');
  const body = getSetting(settings, 'popup.body', '');
  const buttonText = getSetting(settings, 'popup.button_text', 'Learn More');
  const buttonUrl = getSetting(settings, 'popup.button_url', '/');
  const image = getSetting(settings, 'popup.image', '');
  const delaySeconds = parseInt(getSetting(settings, 'popup.delay_seconds', '3'), 10) || 3;

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') {
        setDismissed(true);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  useEffect(() => {
    if (!enabled || dismissed || !title) return;

    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= 40) {
        setVisible(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    const timer = setTimeout(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }, delaySeconds * 1000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, dismissed, title, delaySeconds]);

  const close = () => {
    setVisible(false);
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // localStorage not available
    }
  };

  if (!visible || !enabled || !title) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          onClick={close}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
          aria-label="Close popup"
        >
          <X className="h-5 w-5" />
        </button>

        {image && (
          <img src={image} alt="" className="h-48 w-full object-cover" />
        )}

        <div className="p-6 text-center">
          <h3 className="font-display text-xl font-bold text-slate-900">{title}</h3>
          {body && <p className="mt-2 text-sm text-slate-600">{body}</p>}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to={buttonUrl}
              onClick={close}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              {buttonText}
            </Link>
            <button
              onClick={close}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
