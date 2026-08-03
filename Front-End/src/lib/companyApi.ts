import { apiFetch } from './api';
import type { CompanyProfile } from '../types';

interface ApiOk<T> {
  success: boolean;
  message?: string;
  data: T;
}

export type CompanyPayload = CompanyProfile;

export const emptyCompanyForm = (): CompanyProfile => ({
  name: '',
  tradingName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postcode: '',
  country: 'United Kingdom',
  phone: '',
  email: '',
  website: '',
  vatNumber: '',
  companyNumber: '',
  currency: 'GBP',
  financialYear: 'April – March',
  vatScheme: 'Standard',
  notes: '',
});

export function mapCompany(data: Partial<CompanyProfile> | null | undefined): CompanyProfile {
  const base = emptyCompanyForm();
  if (!data) return base;
  return {
    id: data.id,
    name: data.name ?? '',
    tradingName: data.tradingName ?? '',
    addressLine1: data.addressLine1 ?? '',
    addressLine2: data.addressLine2 ?? '',
    city: data.city ?? '',
    postcode: data.postcode ?? '',
    country: data.country || 'United Kingdom',
    phone: data.phone ?? '',
    email: data.email ?? '',
    website: data.website ?? '',
    vatNumber: data.vatNumber ?? '',
    companyNumber: data.companyNumber ?? '',
    currency: data.currency || 'GBP',
    financialYear: data.financialYear || 'April – March',
    vatScheme: data.vatScheme || 'Standard',
    notes: data.notes ?? '',
  };
}

export async function getCompany(): Promise<CompanyProfile | null> {
  const res = await apiFetch<ApiOk<Partial<CompanyProfile> | null>>('/api/company');
  if (!res.data) return null;
  return mapCompany(res.data);
}

export async function upsertCompany(payload: CompanyPayload): Promise<{
  company: CompanyProfile;
  message: string;
}> {
  const body = {
    name: payload.name,
    tradingName: payload.tradingName,
    addressLine1: payload.addressLine1,
    addressLine2: payload.addressLine2,
    city: payload.city,
    postcode: payload.postcode,
    country: payload.country,
    phone: payload.phone,
    email: payload.email,
    website: payload.website,
    vatNumber: payload.vatNumber,
    companyNumber: payload.companyNumber,
    currency: payload.currency,
    financialYear: payload.financialYear,
    vatScheme: payload.vatScheme,
    notes: payload.notes,
  };

  const res = await apiFetch<ApiOk<Partial<CompanyProfile>>>('/api/company', {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  return {
    company: mapCompany(res.data),
    message: res.message || 'Company profile saved',
  };
}
