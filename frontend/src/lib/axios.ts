import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];
const MAX_429_RETRIES = 1;
const retryCountMap = new Map<string, number>();

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error || !token) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/refresh-token');
        const newToken = data?.data?.token;
        if (newToken) {
          localStorage.setItem('auth_token', newToken);
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        // refresh failed
      }

      processQueue(new Error('Token refresh failed'), null);
      isRefreshing = false;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status === 403 && !originalRequest._retry) {
      const url = originalRequest?.url || 'unknown endpoint';
      const message = error.response?.data?.message || 'You do not have permission to perform this action.';
      const requiredRoles = error.response?.data?.required_roles;
      const yourRoles = error.response?.data?.your_roles;
      console.error(`[403] ${url} — ${message}`, { requiredRoles, yourRoles });
      toast.error(message);
    }

    if (error.response?.status === 429) {
      const retryKey = `${originalRequest.method}:${originalRequest.url}`;
      const currentRetries = retryCountMap.get(retryKey) ?? 0;
      if (currentRetries >= MAX_429_RETRIES) {
        retryCountMap.delete(retryKey);
        toast.error('Too many requests. Please try again later.');
        return Promise.reject(error);
      }
      retryCountMap.set(retryKey, currentRetries + 1);
      const retryAfter = error.response.headers['retry-after'] || 5;
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
