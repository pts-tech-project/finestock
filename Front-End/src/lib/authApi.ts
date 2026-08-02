import { apiFetch, ApiError, clearToken, getToken, setToken } from './api';
import type { ModuleId, User, UserRole } from '../types';

export interface AuthUserPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  companyId: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUserPayload;
    permissions: Record<string, boolean>;
    allowed: string[];
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: AuthUserPayload;
    permissions: Record<string, boolean>;
    allowed: string[];
  };
}

/** Temporary module entitlements until company subscription API exists */
export function modulesForRole(role: UserRole): ModuleId[] {
  switch (role) {
    case 'Owner':
      return ['core', 'hmrc', 'payroll', 'ai'];
    case 'Manager':
      return ['core', 'hmrc', 'payroll'];
    case 'Accountant':
      return ['core', 'hmrc'];
    default:
      return ['core'];
  }
}

export function mapAuthUser(payload: AuthUserPayload): User {
  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    status: payload.status,
    companyId: payload.companyId,
    modules: modulesForRole(payload.role),
  };
}

export async function loginRequest(email: string, password: string) {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });
}

export async function meRequest() {
  return apiFetch<MeResponse>('/api/auth/me');
}

export { ApiError, clearToken, getToken, setToken };
