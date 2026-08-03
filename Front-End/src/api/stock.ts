const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const COMPANY_ID = import.meta.env.VITE_COMPANY_ID || '';
async function get<T>(path: string): Promise<T> {
  if (!COMPANY_ID) throw new Error('VITE_COMPANY_ID is missing from Front-End/.env');
  const response = await fetch(`${API_URL}/companies/${COMPANY_ID}/stock${path}`);
  const body = await response.json().catch(() => ({ message: 'Invalid server response' }));
  if (!response.ok) throw new Error(body.message || 'Stock request failed');
  return body.data;
}
export interface StockBalanceDto { id: string; itemCode: string; name: string; category: string | null; unit: string; reorderLevel: number; quantity: number; averageCost: number; }
export interface StockMovementDto { id: string; movementDate: string; movementType: 'PURCHASE_RECEIPT' | 'ADJUSTMENT' | 'USAGE' | 'WASTE'; quantity: number; unitCost: number; totalCost: number; referenceNumber: string; item: { itemCode: string; name: string; unit: string }; }
export const listStockBalances = () => get<StockBalanceDto[]>('/balances');
export const listStockMovements = () => get<StockMovementDto[]>('/movements');
