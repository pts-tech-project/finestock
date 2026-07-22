import { useMemo, useState } from 'react';
import { Card, SearchInput, Pagination } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Select } from '../components/ui/Input';
import { mockAuditLogs } from '../data/mockData';
import type { AuditLog } from '../types';

export function AuditPage() {
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    return mockAuditLogs.filter((l) => {
      const matchSearch =
        l.user.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.description.toLowerCase().includes(search.toLowerCase());
      const matchModule = module === 'All' || l.module === module;
      return matchSearch && matchModule;
    });
  }, [search, module]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<AuditLog>[] = [
    { key: 'date', header: 'Date', sortable: true },
    { key: 'user', header: 'User' },
    { key: 'action', header: 'Action' },
    { key: 'module', header: 'Module' },
    { key: 'description', header: 'Description' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Track user actions across the system</p>
        </div>
      </div>

      <Card>
        <div className="toolbar" style={{ marginBottom: '1rem' }}>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search logs..." />
          <Select value={module} onChange={(e) => { setModule(e.target.value); setPage(1); }} style={{ width: 160 }}>
            <option value="All">All Modules</option>
            <option>Inventory</option>
            <option>Sales</option>
            <option>Purchases</option>
            <option>Expenses</option>
            <option>Suppliers</option>
          </Select>
        </div>
        <DataTable columns={columns} data={pageData} keyField="id" emptyTitle="No audit logs found" />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>
    </div>
  );
}
