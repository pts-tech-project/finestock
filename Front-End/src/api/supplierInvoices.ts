import type { GoodsReceipt, SupplierInvoice } from '../types';
import { apiFetch } from '../lib/api';
import { companyApiPath } from '../lib/companyScopedApi';

export interface SupplierInvoiceInput {
  goodsReceiptId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  netAmount: number;
  vatAmount: number;
  notes?: string | null;
  attachment?: File | null;
}
interface Response<T> { success: boolean; message?: string; data: T; pagination?: { page: number; pageSize: number; total: number; totalPages: number } }
async function request<T>(path: string, options?: RequestInit): Promise<Response<T>> {
  return apiFetch<Response<T>>(`${companyApiPath('supplier-invoices')}${path}`, options);
}
export const listEligibleInvoiceReceipts = () => request<GoodsReceipt[]>('/eligible-goods-receipts');
export const listSupplierInvoices = (query: { search?: string; status?: string; page?: number } = {}) => {
  const params = new URLSearchParams({ search: query.search ?? '', status: query.status ?? 'All', page: String(query.page ?? 1), pageSize: '10' });
  return request<SupplierInvoice[]>(`?${params}`);
};
function formData(input: SupplierInvoiceInput) {
  const data = new FormData();
  Object.entries(input).forEach(([key, value]) => { if (key !== 'attachment' && value !== null && value !== undefined) data.append(key, String(value)); });
  if (input.attachment) data.append('attachment', input.attachment);
  return data;
}
export const createSupplierInvoice = (input: SupplierInvoiceInput) => request<SupplierInvoice>('', { method: 'POST', body: formData(input) });
export const updateSupplierInvoice = (id: string, input: SupplierInvoiceInput) => request<SupplierInvoice>(`/${id}`, { method: 'PATCH', body: formData(input) });
export const approveSupplierInvoice = (id: string) => request<SupplierInvoice>(`/${id}/approve`, { method: 'POST' });
export async function openSupplierInvoiceAttachment(id: string, download = false) {
  const blob = await apiFetch<Blob>(`${companyApiPath('supplier-invoices')}/${id}/attachment${download ? '?download=1' : ''}`, { headers: { Accept: 'application/pdf,image/jpeg,image/png' } });
  return blob;
}
