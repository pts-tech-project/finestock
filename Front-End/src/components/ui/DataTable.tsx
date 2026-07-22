import type { ReactNode } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { EmptyState } from './Card';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T extends object>({
  columns,
  data,
  keyField,
  sortKey,
  onSort,
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, textAlign: col.align ?? 'left' }}
                className={col.sortable ? 'sortable' : ''}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="th-inner">
                  {col.header}
                  {col.sortable && <ArrowUpDown size={13} className={sortKey === col.key ? 'active' : ''} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={String(row[keyField])}>
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align ?? 'left' }}>
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        .table-wrap { overflow-x: auto; margin: -0.25rem; }
        .data-table { width: 100%; font-size: 0.875rem; }
        .data-table th {
          text-align: left;
          padding: 0.7rem 0.85rem;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-text-secondary);
          border-bottom: 1px solid var(--color-border);
          white-space: nowrap;
          background: var(--color-bg-muted);
        }
        .data-table th.sortable { cursor: pointer; user-select: none; }
        .data-table th.sortable:hover { color: var(--color-text); }
        .th-inner { display: inline-flex; align-items: center; gap: 0.35rem; }
        .th-inner svg { opacity: 0.35; }
        .th-inner svg.active { opacity: 1; color: var(--color-accent); }
        .data-table td {
          padding: 0.8rem 0.85rem;
          border-bottom: 1px solid var(--color-border);
          vertical-align: middle;
        }
        .data-table tbody tr:hover { background: #f8fafc; }
        .data-table tbody tr:last-child td { border-bottom: none; }
      `}</style>
    </div>
  );
}
