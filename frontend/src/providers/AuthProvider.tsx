import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, token, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      authApi
        .getProfile()
        .then((user) => {
          setUser(user);
        })
        .catch(() => {
          logout();
        });
    }
  }, [isAuthenticated, token, setUser, logout]);

  return <>{children}</>;
}
