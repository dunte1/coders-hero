import { useEffect, useRef } from 'react';
import { useSiteBranding } from '@/hooks/usePublicSiteSettings';
import { useUIStore } from '@/store/uiStore';

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let sat = 0;
  const light = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) hue = ((b - r) / d + 2) / 6;
    else hue = ((r - g) / d + 4) / 6;
  }
  return `${Math.round(hue * 360)} ${Math.round(sat * 100)}% ${Math.round(light * 100)}%`;
}

export function BrandingApplier() {
  const branding = useSiteBranding();
  const { setTheme } = useUIStore();
  const themeSynced = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    if (branding.primaryColor) {
      root.style.setProperty('--color-brand-500', branding.primaryColor);
      root.style.setProperty('--color-brand-600', branding.primaryColor);
      root.style.setProperty('--color-brand-700', branding.primaryColor);
      root.style.setProperty('--primary', hexToHsl(branding.primaryColor));
    }
    if (branding.secondaryColor) {
      root.style.setProperty('--color-teal-700', branding.secondaryColor);
    }
    if (branding.accentColor) {
      root.style.setProperty('--color-amber-500', branding.accentColor);
    }
    root.style.setProperty('--sidebar-bg', branding.sidebarBgColor);
    root.style.setProperty('--sidebar-text', branding.sidebarTextColor);
    root.style.setProperty('--sidebar-active', branding.sidebarActiveColor);
    root.style.setProperty('--sidebar-active-text', branding.sidebarActiveTextColor);
    root.style.setProperty('--header-bg', branding.headerBgColor);
    root.style.setProperty('--header-border', branding.headerBorderColor);
  }, [branding.primaryColor, branding.secondaryColor, branding.accentColor, branding.sidebarBgColor, branding.sidebarTextColor, branding.sidebarActiveColor, branding.sidebarActiveTextColor, branding.headerBgColor, branding.headerBorderColor]);

  useEffect(() => {
    if (!branding.fontFamily || branding.fontFamily === 'Inter') return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${branding.fontFamily}:wght@400;500;600;700&display=swap`;
    link.id = 'dynamic-font';
    const existing = document.getElementById('dynamic-font');
    if (existing) existing.replaceWith(link);
    else document.head.appendChild(link);
    document.documentElement.style.setProperty('--font-sans', `'${branding.fontFamily}', sans-serif`);
  }, [branding.fontFamily]);

  useEffect(() => {
    if (!branding.favicon) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = branding.favicon;
  }, [branding.favicon]);

  useEffect(() => {
    if (!themeSynced.current && branding.themeMode) {
      themeSynced.current = true;
      setTheme(branding.themeMode);
    }
  }, [branding.themeMode, setTheme]);

  useEffect(() => {
    if (!branding.gtagId) return;
    const existing = document.getElementById('gtag-script');
    if (existing) return;
    const script = document.createElement('script');
    script.id = 'gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${branding.gtagId}`;
    document.head.appendChild(script);
    const configScript = document.createElement('script');
    configScript.textContent = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${branding.gtagId}');`;
    document.head.appendChild(configScript);
  }, [branding.gtagId]);

  return null;
}
