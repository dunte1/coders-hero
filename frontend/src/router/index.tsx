import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

export function AppRouter() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
