import type { Supplier } from '../types';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

const COMPANY_ID = import.meta.env.VITE_COMPANY_ID;

interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface SupplierListResponse {
  success: boolean;
  data: Supplier[];
  pagination: Pagination;
}

interface SupplierResponse {
  success: boolean;
  message?: string;
  data: Supplier;
}

interface ListSupplierOptions {
  search?: string;
  status?: 'All' | 'Active' | 'Inactive';
  page?: number;
  pageSize?: number;
}

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

function getSupplierBaseUrl() {
  if (!COMPANY_ID) {
    throw new Error(
      'VITE_COMPANY_ID is missing from Front-End/.env',
    );
  }

  return `${API_URL}/companies/${COMPANY_ID}/suppliers`;
}

async function parseResponse<T>(
  response: Response,
): Promise<T> {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload.message || 'Supplier request failed',
    );
  }

  return payload as T;
}

export async function listSuppliers(
  options: ListSupplierOptions = {},
) {
  const parameters = new URLSearchParams();

  if (options.search) {
    parameters.set('search', options.search);
  }

  if (options.status && options.status !== 'All') {
    parameters.set('status', options.status);
  }

  parameters.set(
    'page',
    String(options.page || 1),
  );

  parameters.set(
    'pageSize',
    String(options.pageSize || 10),
  );

  const response = await fetch(
    `${getSupplierBaseUrl()}?${parameters.toString()}`,
  );

  return parseResponse<SupplierListResponse>(response);
}

export async function getSupplier(
  supplierId: string,
) {
  const response = await fetch(
    `${getSupplierBaseUrl()}/${supplierId}`,
  );

  return parseResponse<SupplierResponse>(response);
}
export async function createSupplier(
  input: CreateSupplierInput,
) {
  const response = await fetch(
    getSupplierBaseUrl(),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    },
  );

  return parseResponse<SupplierResponse>(response);
}

export async function updateSupplier(
  supplierId: string,
  input: UpdateSupplierInput,
) {
  const response = await fetch(
    `${getSupplierBaseUrl()}/${supplierId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    },
  );

  return parseResponse<SupplierResponse>(response);
}

export async function updateSupplierStatus(
  supplierId: string,
  status: 'Active' | 'Inactive',
) {
  const response = await fetch(
    `${getSupplierBaseUrl()}/${supplierId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    },
  );

  return parseResponse<SupplierResponse>(response);
}
