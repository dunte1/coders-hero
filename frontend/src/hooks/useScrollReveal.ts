import { useEffect, useRef } from 'react';

export function useScrollReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Fallback: if IntersectionObserver is not supported, reveal everything
    if (typeof IntersectionObserver === 'undefined') {
      container.querySelectorAll('.reveal').forEach((el) => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px', ...options }
    );

    // Observe all current .reveal elements
    const observeAll = () => {
      container.querySelectorAll('.reveal:not(.revealed)').forEach((el) => {
        observer.observe(el);
      });
    };

    observeAll();

    // Watch for new .reveal elements added to the DOM (e.g. after API data loads)
    const mutationObserver = new MutationObserver(() => {
      observeAll();
    });

    mutationObserver.observe(container, { childList: true, subtree: true });

    // Safety fallback: if IntersectionObserver hasn't revealed anything after 4s, force reveal
    const safetyTimer = setTimeout(() => {
      container.querySelectorAll('.reveal:not(.revealed)').forEach((el) => {
        el.classList.add('revealed');
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
