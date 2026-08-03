import { useSyncExternalStore } from 'react';
import {
  getDailySales,
  getSalesImports,
  subscribeSalesStore,
} from './salesStore';

export function useDailySales() {
  return useSyncExternalStore(subscribeSalesStore, getDailySales, getDailySales);
}

export function useSalesImports() {
  return useSyncExternalStore(subscribeSalesStore, getSalesImports, getSalesImports);
}
