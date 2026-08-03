import { apiFetch } from '../lib/api';
import { companyApiPath } from '../lib/companyScopedApi';
async function get<T>(path: string): Promise<T> {
  const body = await apiFetch<{ data: T }>(`${companyApiPath('stock')}${path}`);
  return body.data;
}
export interface StockBalanceDto { id: string; itemCode: string; name: string; category: string | null; unit: string; reorderLevel: number; quantity: number; averageCost: number; }
export interface StockMovementDto { id: string; movementDate: string; movementType: 'PURCHASE_RECEIPT' | 'ADJUSTMENT' | 'USAGE' | 'WASTE'; quantity: number; unitCost: number; totalCost: number; referenceNumber: string; item: { itemCode: string; name: string; unit: string }; }
export const listStockBalances = () => get<StockBalanceDto[]>('/balances');
export const listStockMovements = () => get<StockMovementDto[]>('/movements');
