import { useQuery } from '@tanstack/react-query';
import { websiteApi } from '@/lib/websiteApi';
import { getSetting, type PublicSiteSettings } from '@/types/website';

export function usePublicSiteSettings() {
  return useQuery({
    queryKey: ['website', 'site'],
    queryFn: websiteApi.site.get,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSiteName() {
  const { data } = usePublicSiteSettings();
  return getSetting(data?.settings, 'general.site_name', "Coder's Hero");
}

export function useSiteBranding() {
  const { data } = usePublicSiteSettings();
  const s = data?.settings;
  return {
    siteName: getSetting(s, 'general.site_name', "Coder's Hero"),
    tagline: getSetting(s, 'general.tagline'),
    logo: getSetting(s, 'branding.logo'),
    logoWide: getSetting(s, 'branding.logo_wide'),
    logoIcon: getSetting(s, 'branding.logo_icon'),
    favicon: getSetting(s, 'branding.favicon'),
    primaryColor: getSetting(s, 'branding.primary_color', '#00E5E5'),
    secondaryColor: getSetting(s, 'branding.secondary_color', '#00C8D7'),
    accentColor: getSetting(s, 'branding.accent_color', '#F59E0B'),
    sidebarBgColor: getSetting(s, 'branding.sidebar_bg_color', '#0F172A'),
    sidebarTextColor: getSetting(s, 'branding.sidebar_text_color', '#CBD5E1'),
    sidebarActiveColor: getSetting(s, 'branding.sidebar_active_color', '#00E5E5'),
    sidebarActiveTextColor: getSetting(s, 'branding.sidebar_active_text_color', '#FFFFFF'),
    headerBgColor: getSetting(s, 'branding.header_bg_color', '#FFFFFF'),
    headerBorderColor: getSetting(s, 'branding.header_border_color', '#E2E8F0'),
    themeMode: getSetting(s, 'branding.theme_mode', 'light') as 'light' | 'dark' | 'system',
    fontFamily: getSetting(s, 'branding.font_family', 'Inter'),
    seoTitle: getSetting(s, 'seo.meta_title'),
    seoDescription: getSetting(s, 'seo.meta_description'),
    ogImage: getSetting(s, 'seo.og_image'),
    gtagId: getSetting(s, 'analytics.gtag_id'),
  } as const;
}
