import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { popupsApi, type Popup } from '@/lib/popupsApi';
import { cn } from '@/lib/utils';

const DISMISS_PREFIX = 'ch_popup_dismissed_';

function shouldShowPopup(popup: Popup): boolean {
  try {
    const frequency = popup.frequency;

    if (frequency === 'once_ever') {
      if (localStorage.getItem(DISMISS_PREFIX + popup.id) === '1') return false;
    }

    if (frequency === 'once_per_day') {
      const key = DISMISS_PREFIX + popup.id + '_day';
      const dismissed = localStorage.getItem(key);
      if (dismissed === new Date().toDateString()) return false;
    }

    if (frequency === 'once_per_session') {
      if (sessionStorage.getItem(DISMISS_PREFIX + popup.id) === '1') return false;
    }
  } catch {
    // storage not available
  }

  return true;
}

function dismissPopup(popup: Popup) {
  try {
    const frequency = popup.frequency;

    if (frequency === 'once_ever') {
      localStorage.setItem(DISMISS_PREFIX + popup.id, '1');
    } else if (frequency === 'once_per_day') {
      localStorage.setItem(DISMISS_PREFIX + popup.id + '_day', new Date().toDateString());
    } else if (frequency === 'once_per_session') {
      sessionStorage.setItem(DISMISS_PREFIX + popup.id, '1');
    }
  } catch {
    // storage not available
  }
}

const ANIMATION_CLASSES: Record<string, string> = {
  fade: 'animate-in fade-in duration-300',
  slide_up: 'animate-in slide-in-from-bottom-8 duration-400',
  bounce: 'animate-in zoom-in-95 duration-300',
  zoom: 'animate-in zoom-in-50 duration-200',
};

const OVERLAY_CLASSES: Record<string, string> = {
  dark: 'bg-black/50 backdrop-blur-sm',
  light: 'bg-black/20 backdrop-blur-sm',
  blur: 'bg-black/40 backdrop-blur-md',
  none: 'bg-black/30',
};

export function PopupAd() {
  const [visible, setVisible] = useState(false);
  const [activePopup, setActivePopup] = useState<Popup | null>(null);

  const { data: popups } = useQuery({
    queryKey: ['public', 'popups'],
    queryFn: popupsApi.public.get,
  });

  useEffect(() => {
    if (!popups || popups.length === 0) return;

    const eligible = popups.filter(shouldShowPopup);
    if (eligible.length === 0) return;

    const popup = eligible[0];
    setActivePopup(popup);

    const timer = setTimeout(() => {
      const handleScroll = () => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent >= 40) {
          setVisible(true);
          window.removeEventListener('scroll', handleScroll);
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', () => {});
    };
  }, [popups]);

  const close = () => {
    setVisible(false);
    if (activePopup) dismissPopup(activePopup);
  };

  if (!visible || !activePopup) return null;

  const popup = activePopup;
  const isSeasonal = popup.type === 'seasonal_greeting';

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center p-4',
        OVERLAY_CLASSES[popup.overlay_style] || OVERLAY_CLASSES.dark
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={cn(
          'relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl',
          ANIMATION_CLASSES[popup.animation_style] || ANIMATION_CLASSES.fade
        )}
      >
        <button
          onClick={close}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
          aria-label="Close popup"
        >
          <X className="h-5 w-5" />
        </button>

        {popup.image && (
          <img src={popup.image_url || popup.image} alt="" className="h-48 w-full object-cover" />
        )}

        <div className={cn('p-6 text-center', isSeasonal && 'bg-gradient-to-b from-emerald-50 to-white')}>
          {isSeasonal && (
            <span className="mb-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Seasonal Greeting
            </span>
          )}
          <h3 className="font-display text-xl font-bold text-slate-900">{popup.title}</h3>
          {popup.body && <p className="mt-2 text-sm text-slate-600">{popup.body}</p>}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {popup.button_text && popup.button_url && (
              <Link
                to={popup.button_url}
                onClick={close}
                className={cn(
                  'inline-flex h-11 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white transition-colors',
                  isSeasonal
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-brand-600 hover:bg-brand-700'
                )}
              >
                {popup.button_text}
              </Link>
            )}
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
