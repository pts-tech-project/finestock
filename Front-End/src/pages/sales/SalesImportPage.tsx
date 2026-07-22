import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Card, Badge } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { mockSalesImports } from '../../data/mockData';
import type { SalesImport } from '../../types';

export function SalesImportPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [imports, setImports] = useState(mockSalesImports);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    if (!file) {
      toast('Please choose a file first', 'error');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setImports((prev) => [
      {
        id: crypto.randomUUID(),
        fileName: file.name,
        uploadDate: new Date().toLocaleString('en-GB'),
        records: Math.floor(Math.random() * 100) + 150,
        status: 'Success',
      },
      ...prev,
    ]);
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
    setLoading(false);
    toast('Sales imported successfully');
  };

  const columns: Column<SalesImport>[] = [
    {
      key: 'fileName',
      header: 'File Name',
      render: (r) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <FileSpreadsheet size={16} color="#0f766e" /> {r.fileName}
        </span>
      ),
    },
    { key: 'uploadDate', header: 'Upload Date' },
    { key: 'records', header: 'Records', align: 'right' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={r.status === 'Success' ? 'success' : r.status === 'Failed' ? 'danger' : 'info'}>
          {r.status}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (r) => (
        <Button size="sm" variant="ghost" onClick={() => toast(`Viewing ${r.fileName}`, 'info')}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Import</h1>
          <p className="page-subtitle">Upload EPOS daily sales files</p>
        </div>
      </div>

      <Card title="Upload EPOS File">
        <div className="upload-zone">
          <Upload size={32} strokeWidth={1.5} />
          <p>Choose a CSV or Excel file from your EPOS system</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file && <p className="file-name">{file.name}</p>}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <Button onClick={handleImport} loading={loading}>
              Import Sales
            </Button>
          </div>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.75rem' }}>
            Supported: CSV, Excel
          </p>
        </div>
      </Card>

      <Card title="Import History">
        <DataTable columns={columns} data={imports} keyField="id" />
      </Card>

      <style>{`
        .upload-zone {
          border: 2px dashed var(--color-border-strong);
          border-radius: var(--radius-md);
          padding: 2rem;
          text-align: center;
          color: var(--color-text-secondary);
          display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
          background: var(--color-bg-muted);
        }
        .upload-zone input[type="file"] { margin-top: 0.5rem; font-size: 0.85rem; }
        .file-name { font-weight: 600; color: var(--color-accent); margin-top: 0.5rem; }
      `}</style>
    </div>
  );
}
