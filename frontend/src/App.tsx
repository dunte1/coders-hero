import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { AppRouter } from '@/router';
import { Toaster } from 'sonner';
import { BrandingApplier } from '@/components/providers/BrandingApplier';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrandingApplier />
        <AppRouter />
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
