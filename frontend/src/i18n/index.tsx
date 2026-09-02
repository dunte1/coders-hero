import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { usePublicSiteSettings } from '@/hooks/usePublicSiteSettings';
import { translations, type Locale } from './translations';

const STORAGE_KEY = 'app_language';

interface I18nContextValue {
  language: Locale;
  setLanguage: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function normalizeLocale(value?: string | null): Locale | undefined {
  if (!value) return undefined;
  const v = value.trim().toLowerCase();
  if (v === 'en' || v === 'english' || v.startsWith('english')) return 'en';
  if (v === 'sw' || v === 'swa' || v === 'kiswahili' || v.startsWith('kiswahili')) return 'sw';
  if (v === 'fr' || v === 'fra' || v === 'french' || v.startsWith('french')) return 'fr';
  return undefined;
}

function readStored(): Locale | undefined {
  try {
    return normalizeLocale(localStorage.getItem(STORAGE_KEY));
  } catch {
    return undefined;
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Read the admin-configured default language from the public site settings,
  // which are accessible to every user. (The admin-only settings endpoint must
  // not be called from the app shell, otherwise students/parents hit a 403 on
  // every page load.)
  const { data: settings } = usePublicSiteSettings();

  const languageSetting = settings?.settings?.localization?.language;

  const [language, setLanguageState] = useState<Locale>(() => readStored() ?? 'en');

  // When no explicit per-device override exists, follow the admin-configured
  // "Default language" setting from the backend.
  useEffect(() => {
    if (readStored()) return;
    const resolved = normalizeLocale(languageSetting);
    if (resolved) setLanguageState(resolved);
  }, [languageSetting]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nContextValue>(() => {
    const setLanguage = (locale: Locale) => {
      setLanguageState(locale);
      try {
        localStorage.setItem(STORAGE_KEY, locale);
      } catch {
        // localStorage unavailable (private mode etc.) — in-memory only.
      }
    };

    return {
      language,
      setLanguage,
      t: (key: string) => translations[language][key] ?? key,
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
