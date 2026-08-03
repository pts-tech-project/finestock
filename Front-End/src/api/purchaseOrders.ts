import type { PurchaseOrder } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const COMPANY_ID = import.meta.env.VITE_COMPANY_ID || '';

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
  if (!COMPANY_ID) throw new Error('VITE_COMPANY_ID is missing from Front-End/.env');
  const response = await fetch(`${API_URL}/companies/${COMPANY_ID}/purchase-orders${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const body = await response.json().catch(() => ({ success: false, message: 'Invalid server response' }));
  if (!response.ok) throw new Error(body.message || 'Purchase order request failed');
  return body;
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
