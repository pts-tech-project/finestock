import type { Supplier } from '../types';
import { apiFetch } from '../lib/api';
import { companyApiPath } from '../lib/companyScopedApi';

interface Pagination { page: number; pageSize: number; totalItems: number; totalPages: number; }
interface SupplierListResponse { success: boolean; data: Supplier[]; pagination: Pagination; }
interface SupplierResponse { success: boolean; message?: string; data: Supplier; }
interface ListSupplierOptions { search?: string; status?: 'All' | 'Active' | 'Inactive'; page?: number; pageSize?: number; }

export interface CreateSupplierInput {
  supplierCode: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  vatNumber?: string;
  paymentTerms: string;
  openingBalance: number;
  status: 'Active' | 'Inactive';
}
export type UpdateSupplierInput = Partial<CreateSupplierInput>;

const basePath = () => companyApiPath('suppliers');

export function listSuppliers(options: ListSupplierOptions = {}) {
  const query = new URLSearchParams({ page: String(options.page || 1), pageSize: String(options.pageSize || 10) });
  if (options.search) query.set('search', options.search);
  if (options.status && options.status !== 'All') query.set('status', options.status);
  return apiFetch<SupplierListResponse>(`${basePath()}?${query}`);
}
export const getSupplier = (id: string) => apiFetch<SupplierResponse>(`${basePath()}/${id}`);
export const createSupplier = (input: CreateSupplierInput) => apiFetch<SupplierResponse>(basePath(), { method: 'POST', body: JSON.stringify(input) });
export const updateSupplier = (id: string, input: UpdateSupplierInput) => apiFetch<SupplierResponse>(`${basePath()}/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const updateSupplierStatus = (id: string, status: 'Active' | 'Inactive') => apiFetch<SupplierResponse>(`${basePath()}/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
