import { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { routes } from './routes';
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute';
import { PageSpinner } from '@/components/ui/Spinner';
import { AppLayout } from '@/components/layout/AppLayout';
import { WebsiteLayout } from '@/components/website/WebsiteLayout';

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageSpinner />}>
      {children}
    </Suspense>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    // On route change, exit then enter
    setTransitionStage('exit');
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionStage('enter');
    }, 150);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      className={transitionStage === 'enter' ? 'page-transition' : ''}
      style={{ opacity: transitionStage === 'exit' ? 0 : 1, transition: 'opacity 0.15s ease-out' }}
    >
      {displayChildren}
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PageTransition>
        <Routes>
          {routes.map((route) => {
            const isPublic = route.meta?.public;
            const isWebsite = route.meta?.layout === 'website';
            const Element = route.element;

            if (isWebsite) {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <WebsiteLayout>
                      <SuspenseWrapper>
                        <Element />
                      </SuspenseWrapper>
                    </WebsiteLayout>
                  }
                />
              );
            }

            if (isPublic) {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <SuspenseWrapper>
                      <Element />
                    </SuspenseWrapper>
                  }
                />
              );
            }

            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <ProtectedRoute
                    roles={route.meta?.roles}
                    permissions={route.meta?.permissions}
                  >
                    <AppLayout>
                      <SuspenseWrapper>
                        <Element />
                      </SuspenseWrapper>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
            );
          })}
        </Routes>
      </PageTransition>
    </BrowserRouter>
  );
}
