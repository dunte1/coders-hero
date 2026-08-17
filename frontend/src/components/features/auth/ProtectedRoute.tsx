import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageSpinner } from '@/components/ui/Spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
}

export function ProtectedRoute({ children, roles, permissions }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, requiresTwoFactor } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  if (requiresTwoFactor) {
    return <Navigate to="/two-factor/challenge" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0) {
    const userRole = user?.role?.name?.toLowerCase();
    if (!userRole || !roles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (permissions && permissions.length > 0) {
    const userPermissions = user?.role?.permissions?.map((p) => p.codename) || [];
    const hasAllPermissions = permissions.every((p) => userPermissions.includes(p));
    if (!hasAllPermissions) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
