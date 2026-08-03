import type { GoodsReceipt, PurchaseOrder } from '../types';
import { apiFetch } from '../lib/api';
import { companyApiPath } from '../lib/companyScopedApi';
export interface GoodsReceiptInput { purchaseOrderId: string; receiptDate: string; deliveryNoteNumber?: string | null; notes?: string | null; lines: { purchaseOrderLineId: string; quantityReceived: number }[]; }
interface Response<T> { success: boolean; message?: string; data: T; pagination?: { page: number; pageSize: number; total: number; totalPages: number } }
async function request<T>(path: string, options?: RequestInit): Promise<Response<T>> {
  return apiFetch<Response<T>>(`${companyApiPath('goods-receipts')}${path}`, options);
}
export const listEligiblePurchaseOrders = () => request<PurchaseOrder[]>('/eligible-purchase-orders');
export const listGoodsReceipts = (status = 'All', page = 1) => request<GoodsReceipt[]>(`?status=${status}&page=${page}&pageSize=10`);
export const createGoodsReceipt = (input: GoodsReceiptInput) => request<GoodsReceipt>('', { method: 'POST', body: JSON.stringify(input) });
export const updateGoodsReceipt = (id: string, input: GoodsReceiptInput) => request<GoodsReceipt>(`/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const approveGoodsReceipt = (id: string) => request<GoodsReceipt>(`/${id}/approve`, { method: 'POST' });
