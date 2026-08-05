import type { PurchaseOrder } from '../types';
import { apiFetch } from '../lib/api';
import { companyApiPath } from '../lib/companyScopedApi';

export interface PurchaseOrderInput {
  supplierId?: string | null;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate?: string | null;
  notes?: string | null;
  lines: { itemId: string; orderedQuantity: number; unitPrice: number; vatRate: number }[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: { page: number; pageSize: number; total: number; totalPages: number };
}

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  return apiFetch<ApiResponse<T>>(`${companyApiPath('purchase-orders')}${path}`, options);
}

export function listPurchaseOrders(params: { search?: string; status?: string; page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== '' && value !== 'All') query.set(key, String(value)); });
  return request<PurchaseOrder[]>(`?${query}`);
}
export function createPurchaseOrder(input: PurchaseOrderInput) {
  return request<PurchaseOrder>('', { method: 'POST', body: JSON.stringify(input) });
}
export function updatePurchaseOrder(id: string, input: PurchaseOrderInput) {
  return request<PurchaseOrder>(`/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}
export function approvePurchaseOrder(id: string) {
  return request<PurchaseOrder>(`/${id}/approve`, { method: 'POST' });
}
export function receivePurchaseOrder(id: string, lines: { lineId: string; quantity: number }[]) {
  return request<PurchaseOrder>(`/${id}/receive`, { method: 'POST', body: JSON.stringify({ lines }) });
}
