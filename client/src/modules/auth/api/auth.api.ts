// ============================================================
// Auth API - Backend calls
// ============================================================

import { apiClient } from '../../../core/api/apiClient';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', data);
  },

  logout: async (): Promise<void> => {
    return apiClient.post('/auth/logout');
  },

  refreshToken: async (): Promise<{ access_token: string }> => {
    return apiClient.post('/auth/refresh');
  },

  getCurrentUser: async (): Promise<LoginResponse['user']> => {
    return apiClient.get('/auth/me');
  },
};
