import { create } from 'zustand';
import type { User } from '@/types';

const PENDING_TWO_FACTOR_KEY = 'auth_pending_two_factor_token';

function readStoredUser(): User | null {
  try {
    const stored = localStorage.getItem('auth_user');
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
}

function readPendingTwoFactorToken(): string | null {
  try {
    return sessionStorage.getItem(PENDING_TWO_FACTOR_KEY);
  } catch {
    return null;
  }
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresTwoFactor: boolean;
  pendingTwoFactorToken: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setUserPermissions: (permissions: string[]) => void;
  setLoading: (loading: boolean) => void;
  beginTwoFactor: (pendingToken: string) => void;
  completeTwoFactor: (user: User, token: string) => void;
  clearRequiresTwoFactor: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: readStoredUser(),
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  requiresTwoFactor: !!readPendingTwoFactorToken(),
  pendingTwoFactorToken: readPendingTwoFactorToken(),
  login: (token: string, user: User) => {
    try {
      sessionStorage.removeItem(PENDING_TWO_FACTOR_KEY);
    } catch {
      // sessionStorage may be unavailable; ignore
    }
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({
      token,
      user,
      isAuthenticated: true,
      isLoading: false,
      requiresTwoFactor: false,
      pendingTwoFactorToken: null,
    });
  },
  logout: () => {
    try {
      sessionStorage.removeItem(PENDING_TWO_FACTOR_KEY);
    } catch {
      // sessionStorage may be unavailable; ignore
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      requiresTwoFactor: false,
      pendingTwoFactorToken: null,
    });
  },
  setUser: (user: User) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user });
  },
  setUserPermissions: (_permissions: string[]) => {
    void _permissions;
    // Permissions are managed through roles on the user object
  },
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  beginTwoFactor: (pendingToken: string) => {
    try {
      sessionStorage.setItem(PENDING_TWO_FACTOR_KEY, pendingToken);
    } catch {
      // sessionStorage may be unavailable; ignore
    }
    set({
      requiresTwoFactor: true,
      pendingTwoFactorToken: pendingToken,
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  completeTwoFactor: (user: User, token: string) => {
    try {
      sessionStorage.removeItem(PENDING_TWO_FACTOR_KEY);
    } catch {
      // sessionStorage may be unavailable; ignore
    }
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({
      token,
      user,
      isAuthenticated: true,
      requiresTwoFactor: false,
      pendingTwoFactorToken: null,
      isLoading: false,
    });
  },
  clearRequiresTwoFactor: () => {
    try {
      sessionStorage.removeItem(PENDING_TWO_FACTOR_KEY);
    } catch {
      // sessionStorage may be unavailable; ignore
    }
    set({ requiresTwoFactor: false, pendingTwoFactorToken: null });
  },
}));
