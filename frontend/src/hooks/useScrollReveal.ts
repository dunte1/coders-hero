import { useEffect, useRef, useCallback, useState } from 'react';

export function useScrollReveal(options?: IntersectionObserverInit) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  const callbackRef = useCallback((el: HTMLDivElement | null) => {
    nodeRef.current = el;
    setNode(el);
  }, []);

  useEffect(() => {
    const container = node;
    if (!container) return;

    // Mark container so CSS hides elements until observer reveals them
    container.classList.add('reveal-ready');

    if (typeof IntersectionObserver === 'undefined') {
      container.querySelectorAll('.reveal').forEach((el) => el.classList.add('revealed'));
      container.querySelectorAll('.stagger-children').forEach((el) => el.classList.add('stagger-active'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('reveal')) {
              entry.target.classList.add('revealed');
            }
            if (entry.target.classList.contains('stagger-children')) {
              entry.target.classList.add('stagger-active');
            }
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

    const observeAll = () => {
      container.querySelectorAll('.reveal:not(.revealed)').forEach((el) => {
        observer.observe(el);
      });
      container.querySelectorAll('.stagger-children:not(.stagger-active)').forEach((el) => {
        observer.observe(el);
      });
    };

    observeAll();

    const mutationObserver = new MutationObserver(() => {
      observeAll();
    });

    mutationObserver.observe(container, { childList: true, subtree: true });

    // Safety fallback: force reveal after 2s
    const safetyTimer = setTimeout(() => {
      container.querySelectorAll('.reveal:not(.revealed)').forEach((el) => {
        el.classList.add('revealed');
      });
      container.querySelectorAll('.stagger-children:not(.stagger-active)').forEach((el) => {
        el.classList.add('stagger-active');
      });
    }, 2000);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      clearTimeout(safetyTimer);
    };
  }, [node, options]);

  return callbackRef;
}
