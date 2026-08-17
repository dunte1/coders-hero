import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import type { TwoFactorStatus, VerifyTwoFactorRequest } from '@/types';

export function useTwoFactorStatus() {
  return useQuery<TwoFactorStatus>({
    queryKey: ['two-factor', 'status'],
    queryFn: authApi.getTwoFactorStatus,
  });
}

export function useEnableTwoFactor() {
  return useMutation({
    mutationFn: () => authApi.enableTwoFactor(),
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to enable two-factor authentication');
    },
  });
}

export function useConfirmTwoFactor() {
  return useMutation({
    mutationFn: (code: string) => authApi.confirmTwoFactor(code),
    onSuccess: () => {
      toast.success('Two-factor authentication enabled');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Invalid verification code');
    },
  });
}

export function useDisableTwoFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { password: string }) => authApi.disableTwoFactor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['two-factor', 'status'] });
      toast.success('Two-factor authentication disabled');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to disable two-factor authentication');
    },
  });
}

export function useRegenerateRecoveryCodes() {
  return useMutation({
    mutationFn: () => authApi.regenerateRecoveryCodes(),
    onSuccess: () => {
      toast.success('Recovery codes regenerated');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to regenerate recovery codes');
    },
  });
}

export function useChallengeTwoFactor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const completeTwoFactor = useAuthStore((state) => state.completeTwoFactor);

  return useMutation({
    mutationFn: (data: VerifyTwoFactorRequest) => authApi.challengeTwoFactor(data),
    onSuccess: (response) => {
      completeTwoFactor(response.user, response.token);
      queryClient.clear();
      toast.success('Authentication successful');
      navigate('/dashboard');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Verification failed');
    },
  });
}
