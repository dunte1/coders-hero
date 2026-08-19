import { useEffect, useRef } from 'react';

export function useScrollReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Fallback: if IntersectionObserver is not supported, reveal everything
    if (typeof IntersectionObserver === 'undefined') {
      container.querySelectorAll('.reveal').forEach((el) => el.classList.add('revealed'));
      container.querySelectorAll('.stagger-children').forEach((el) => el.classList.add('stagger-active'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger reveal
            if (entry.target.classList.contains('reveal')) {
              entry.target.classList.add('revealed');
            }
            // Trigger stagger-children
            if (entry.target.classList.contains('stagger-children')) {
              entry.target.classList.add('stagger-active');
            }
            // Also check children for stagger-children
            if (entry.target.classList.contains('reveal')) {
              const staggerChildren = entry.target.querySelector('.stagger-children');
              if (staggerChildren) {
                staggerChildren.classList.add('stagger-active');
              }
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px', ...options }
    );

    // Observe all current .reveal and .stagger-children elements
    const observeAll = () => {
      container.querySelectorAll('.reveal:not(.revealed)').forEach((el) => {
        observer.observe(el);
      });
      container.querySelectorAll('.stagger-children:not(.stagger-active)').forEach((el) => {
        observer.observe(el);
      });
    };

    observeAll();

    // Watch for new elements added to the DOM (e.g. after API data loads)
    const mutationObserver = new MutationObserver(() => {
      observeAll();
    });

    mutationObserver.observe(container, { childList: true, subtree: true });

    // Safety fallback: if nothing has revealed after 4s, force reveal everything
    const safetyTimer = setTimeout(() => {
      container.querySelectorAll('.reveal:not(.revealed)').forEach((el) => {
        el.classList.add('revealed');
      });
      container.querySelectorAll('.stagger-children:not(.stagger-active)').forEach((el) => {
        el.classList.add('stagger-active');
      });
    }, 4000);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      clearTimeout(safetyTimer);
    };
  }, [options]);

  return ref;
}
