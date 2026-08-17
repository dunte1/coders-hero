import { useEffect } from 'react';

interface PageMetaOptions {
  title?: string;
  description?: string;
  ogImage?: string;
}

function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name';
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function usePageMeta({ title, description, ogImage }: PageMetaOptions) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  useEffect(() => {
    if (description) setMeta('description', description);
  }, [description]);

  useEffect(() => {
    if (ogImage) setMeta('og:image', ogImage, true);
  }, [ogImage]);
}

export function formatSiteTitle(pageTitle: string, siteName = "Coder's Hero"): string {
  return `${pageTitle} | ${siteName}`;
}
