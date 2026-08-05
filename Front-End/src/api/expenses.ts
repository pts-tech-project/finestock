import type { Expense } from '../types';
import { apiFetch } from '../lib/api';
import { companyApiPath } from '../lib/companyScopedApi';
export type ExpenseInput = Pick<Expense, 'expenseDate' | 'category' | 'description' | 'netAmount' | 'vatAmount' | 'paymentMethod'>;
interface Response<T> { success: boolean; data: T; message?: string; pagination?: { page: number; pageSize: number; total: number; totalPages: number } }
const base = () => companyApiPath('expenses');
export const listExpenses = (params: { search?: string; category?: string; status?: string; page?: number }) => { const q = new URLSearchParams(); Object.entries(params).forEach(([k, v]) => { if (v && v !== 'All') q.set(k, String(v)); }); q.set('pageSize', '10'); return apiFetch<Response<Expense[]>>(`${base()}?${q}`); };
export const createExpense = (input: ExpenseInput) => apiFetch<Response<Expense>>(base(), { method: 'POST', body: JSON.stringify(input) });
export const updateExpense = (id: string, input: ExpenseInput) => apiFetch<Response<Expense>>(`${base()}/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const approveExpense = (id: string) => apiFetch<Response<Expense>>(`${base()}/${id}/approve`, { method: 'POST' });
export interface ExpenseSummary { year: number; month: number; total: number; categories: { category: string; amount: number }[]; }
export const getExpenseSummary = (year = new Date().getFullYear(), month = new Date().getMonth() + 1) => apiFetch<Response<ExpenseSummary>>(`${base()}/summary?year=${year}&month=${month}`);
