import type { Product } from '../types';
import { apiFetch } from '../lib/api';
import { companyApiPath } from '../lib/companyScopedApi';

export type ItemInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: { page: number; pageSize: number; total: number; totalPages: number };
}

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  return apiFetch<ApiResponse<T>>(`${companyApiPath('items')}${path}`, options);
}

export async function listItems(params: {
  search?: string;
  itemType?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  return request<Product[]>(`?${query.toString()}`);
}

export async function createItem(input: ItemInput) {
  return request<Product>('', { method: 'POST', body: JSON.stringify(input) });
}

export async function updateItem(itemId: string, input: ItemInput) {
  return request<Product>(`/${itemId}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export async function updateItemStatus(itemId: string, status: Product['status']) {
  return request<Product>(`/${itemId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}
