import { mockDailySales, mockSalesImports } from './mockData';
import type { DailySale, SalesImport } from '../types';

let dailySales: DailySale[] = [...mockDailySales];
let salesImports: SalesImport[] = [...mockSalesImports];

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeSalesStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDailySales(): DailySale[] {
  return dailySales;
}

export function getSalesImports(): SalesImport[] {
  return salesImports;
}

export function addImportedSale(sale: DailySale, record: SalesImport) {
  // Replace same-date Square/EPOS row if present, otherwise prepend
  const existingIdx = dailySales.findIndex((s) => s.date === sale.date);
  if (existingIdx >= 0) {
    dailySales = [
      ...dailySales.slice(0, existingIdx),
      sale,
      ...dailySales.slice(existingIdx + 1),
    ];
  } else {
    dailySales = [sale, ...dailySales];
  }
  salesImports = [record, ...salesImports];
  notify();
}

export function updateImportStatus(id: string, status: SalesImport['status']) {
  salesImports = salesImports.map((r) => (r.id === id ? { ...r, status } : r));
  notify();
}
