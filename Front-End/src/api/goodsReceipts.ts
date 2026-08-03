import type { GoodsReceipt, PurchaseOrder } from '../types';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const COMPANY_ID = import.meta.env.VITE_COMPANY_ID || '';
export interface GoodsReceiptInput { purchaseOrderId: string; receiptDate: string; deliveryNoteNumber?: string | null; notes?: string | null; lines: { purchaseOrderLineId: string; quantityReceived: number }[]; }
interface Response<T> { success: boolean; message?: string; data: T; pagination?: { page: number; pageSize: number; total: number; totalPages: number } }
async function request<T>(path: string, options?: RequestInit): Promise<Response<T>> {
  if (!COMPANY_ID) throw new Error('VITE_COMPANY_ID is missing from Front-End/.env');
  const response = await fetch(`${API_URL}/companies/${COMPANY_ID}/goods-receipts${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } });
  const body = await response.json().catch(() => ({ message: 'Invalid server response' }));
  if (!response.ok) throw new Error(body.message || 'Goods receipt request failed');
  return body;
}
export const listEligiblePurchaseOrders = () => request<PurchaseOrder[]>('/eligible-purchase-orders');
export const listGoodsReceipts = (status = 'All', page = 1) => request<GoodsReceipt[]>(`?status=${status}&page=${page}&pageSize=10`);
export const createGoodsReceipt = (input: GoodsReceiptInput) => request<GoodsReceipt>('', { method: 'POST', body: JSON.stringify(input) });
export const updateGoodsReceipt = (id: string, input: GoodsReceiptInput) => request<GoodsReceipt>(`/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const approveGoodsReceipt = (id: string) => request<GoodsReceipt>(`/${id}/approve`, { method: 'POST' });
