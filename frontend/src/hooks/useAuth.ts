import { useAuthStore } from '@/store/authStore';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LoginRequest, RegisterRequest } from '@/types';
import { toast } from 'sonner';

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    requiresTwoFactor,
    login,
    logout,
    setUser,
    setLoading,
    beginTwoFactor,
    completeTwoFactor,
    clearRequiresTwoFactor,
  } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      if (response.requires_two_factor) {
        beginTwoFactor(response.token);
        toast.info('Two-factor authentication required');
        navigate('/two-factor/challenge');
        return;
      }
      login(response.token, response.user);
      toast.success('Welcome back!');
      navigate(response.user.role?.name?.toLowerCase() === 'parent' ? '/parent' : '/dashboard');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      toast.success('Registration successful! Please login.');
      navigate('/login');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Registration failed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    staleTime: 0,
  });

  const refreshProfile = useCallback(async () => {
    try {
      const user = await authApi.getProfile();
      setUser(user);
      queryClient.setQueryData(['profile'], user);
    } catch {
      // profile fetch failed silently
    }
  }, [setUser, queryClient]);

  const sendEmailVerificationMutation = useMutation({
    mutationFn: () => authApi.sendEmailVerification(),
    onSuccess: () => {
      toast.success('Verification email sent');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to send verification email');
    },
  });

  const resendEmailVerificationMutation = useMutation({
    mutationFn: () => authApi.resendEmailVerification(),
    onSuccess: () => {
      toast.success('Verification email sent');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to resend verification email');
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: ({ id, hash }: { id: string; hash: string }) => authApi.verifyEmail(id, hash),
  });

  const handleLogin = useCallback(
    (data: LoginRequest) => {
      setLoading(true);
      loginMutation.mutate(data);
    },
    [loginMutation, setLoading]
  );

  const handleRegister = useCallback(
    (data: RegisterRequest) => {
      registerMutation.mutate(data);
    },
    [registerMutation]
  );

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const hasRole = useCallback(
    (roleName: string) => {
      return user?.role?.name === roleName;
    },
    [user]
  );

  const hasPermission = useCallback(
    (permissionName: string) => {
      return user?.role?.permissions?.some((p) => p.codename === permissionName) ?? false;
    },
    [user]
  );

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    requiresTwoFactor,
    profile: profileQuery.data,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    setUser,
    refreshProfile,
    hasRole,
    hasPermission,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    beginTwoFactor,
    completeTwoFactor,
    clearRequiresTwoFactor,
    sendEmailVerification: sendEmailVerificationMutation,
    resendEmailVerification: resendEmailVerificationMutation,
    verifyEmail: verifyEmailMutation,
  };
}
