import { apiFetch } from './api';
import { mapAuthUser, type AuthUserPayload } from './authApi';
import type { User, UserRole } from '../types';

interface ApiOk<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface UserListParams {
  search?: string;
  role?: string;
  status?: string;
}

export interface UserWritePayload {
  name: string;
  email: string;
  role: UserRole;
  status: User['status'];
  companyId?: string | null;
}

function mapUser(payload: AuthUserPayload): User {
  return mapAuthUser(payload);
}

export async function listUsers(params: UserListParams = {}): Promise<User[]> {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.role && params.role !== 'All') query.set('role', params.role);
  if (params.status && params.status !== 'All') query.set('status', params.status);
  const qs = query.toString();
  const res = await apiFetch<ApiOk<AuthUserPayload[]>>(`/api/users${qs ? `?${qs}` : ''}`);
  return (res.data ?? []).map(mapUser);
}

export async function createUser(payload: UserWritePayload): Promise<{
  user: User;
  emailSent: boolean;
  previewUrl?: string | null;
}> {
  const res = await apiFetch<
    ApiOk<{
      user: AuthUserPayload;
      emailSent: boolean;
      emailProvider?: string | null;
      previewUrl?: string | null;
    }>
  >('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return {
    user: mapUser(res.data.user),
    emailSent: Boolean(res.data.emailSent),
    previewUrl: res.data.previewUrl,
  };
}

export async function updateUser(id: string, payload: Partial<UserWritePayload>): Promise<User> {
  const res = await apiFetch<ApiOk<AuthUserPayload>>(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return mapUser(res.data);
}

export async function deactivateUser(id: string): Promise<User> {
  const res = await apiFetch<ApiOk<AuthUserPayload>>(`/api/users/${id}/deactivate`, {
    method: 'PATCH',
  });
  return mapUser(res.data);
}

export async function resetUserPassword(id: string): Promise<{
  user: User;
  emailSent: boolean;
  previewUrl?: string | null;
}> {
  const res = await apiFetch<
    ApiOk<{
      user: AuthUserPayload;
      emailSent: boolean;
      previewUrl?: string | null;
    }>
  >(`/api/users/${id}/reset-password`, {
    method: 'POST',
  });
  return {
    user: mapUser(res.data.user),
    emailSent: Boolean(res.data.emailSent),
    previewUrl: res.data.previewUrl,
  };
}
