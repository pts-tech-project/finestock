import type { Product } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const COMPANY_ID = import.meta.env.VITE_COMPANY_ID || '';

export type ItemInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: { page: number; pageSize: number; total: number; totalPages: number };
}

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  if (!COMPANY_ID) throw new Error('VITE_COMPANY_ID is missing from Front-End/.env');
  const response = await fetch(`${API_URL}/companies/${COMPANY_ID}/items${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const body = await response.json().catch(() => ({ success: false, message: 'Invalid server response' }));
  if (!response.ok) throw new Error(body.message || 'Item request failed');
  return body;
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
