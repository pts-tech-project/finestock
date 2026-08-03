import { apiFetch } from './api';
import type { UserRole } from '../types';

interface ApiOk<T> {
  success: boolean;
  message?: string;
  data: T;
}

export type PermissionMap = Record<string, boolean>;

export interface RoleRecord {
  id?: string;
  name: UserRole;
  isSystem?: boolean;
  permissions: PermissionMap;
}

export interface RolesMatrixResponse {
  roles: RoleRecord[];
  permissions: string[];
  matrix: Record<string, PermissionMap>;
}

export async function fetchRolesMatrix(): Promise<RolesMatrixResponse> {
  const res = await apiFetch<ApiOk<RolesMatrixResponse>>('/api/roles');
  return res.data;
}

export async function createRole(
  name: string,
  permissions?: PermissionMap,
): Promise<RoleRecord> {
  const res = await apiFetch<ApiOk<RoleRecord>>('/api/roles', {
    method: 'POST',
    body: JSON.stringify({ name, permissions }),
  });
  return res.data;
}

export async function updateRolePermissions(
  role: UserRole,
  permissions: PermissionMap,
): Promise<{ name: UserRole; permissions: PermissionMap }> {
  const res = await apiFetch<ApiOk<{ name: UserRole; permissions: PermissionMap }>>(
    `/api/roles/${encodeURIComponent(role)}/permissions`,
    {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    },
  );
  return res.data;
}

export async function deleteRole(role: UserRole): Promise<void> {
  await apiFetch(`/api/roles/${encodeURIComponent(role)}`, {
    method: 'DELETE',
  });
}
