import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { I18nProvider } from '@/i18n';
import { AppRouter } from '@/router';
import { Toaster } from 'sonner';
import { BrandingApplier } from '@/components/providers/BrandingApplier';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <I18nProvider>
          <AuthProvider>
            <BrandingApplier />
            <AppRouter />
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </I18nProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
