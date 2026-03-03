import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

/**
 * Singleton Axios client.
 * - Tự gắn JWT vào header
 * - Tự refresh token khi 401
 * - Centralized error transform
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30_000,
      headers: { 'Content-Type': 'application/json' },
    });

    /* ── Request interceptor ── */
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (err) => Promise.reject(err),
    );

    /* ── Response interceptor ── */
    this.client.interceptors.response.use(
      (res) => res,
      async (err) => {
        const original = err.config as AxiosRequestConfig & { _retry?: boolean };

        // 401 → try refresh once
        if (err.response?.status === 401 && !original._retry) {
          original._retry = true;
          const refresh = localStorage.getItem('refresh_token');
          if (refresh) {
            try {
              const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
                refresh_token: refresh,
              });
              localStorage.setItem('access_token', data.access_token);
              if (data.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token);
              }
              if (original.headers) {
                (original.headers as Record<string, string>).Authorization =
                  `Bearer ${data.access_token}`;
              }
              return this.client(original);
            } catch {
              this.clearAuth();
              window.location.href = '/login';
            }
          } else {
            this.clearAuth();
            window.location.href = '/login';
          }
        }

        return Promise.reject(this.normalizeError(err));
      },
    );
  }

  /* ── Generic HTTP helpers ── */

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.get<T>(url, config);
    return res.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.post<T>(url, data, config);
    return res.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.put<T>(url, data, config);
    return res.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.patch<T>(url, data, config);
    return res.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.delete<T>(url, config);
    return res.data;
  }

  /* ── Upload helper ── */
  async upload<T = any>(url: string, formData: FormData): Promise<T> {
    const res = await this.client.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  /* ── Internal ── */

  private clearAuth() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private normalizeError(err: any) {
    if (err.response?.data) {
      return {
        status: err.response.status,
        message: err.response.data.message || err.message,
        errors: err.response.data.errors,
      };
    }
    return { status: 0, message: err.message || 'Network error' };
  }
}

export const apiClient = new ApiClient();
