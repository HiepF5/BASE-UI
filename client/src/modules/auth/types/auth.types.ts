// ============================================================
// Auth Types
// ============================================================

export interface AuthUser {
  id: string;
  username: string;
  role: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  mockLogin: (username: string, password: string) => { token: string; user: AuthUser };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}
