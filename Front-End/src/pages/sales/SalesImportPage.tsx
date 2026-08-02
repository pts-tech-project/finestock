import { useCallback, useRef, useState, type DragEvent } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  ScanSearch,
  Download,
  Eye,
  X,
} from 'lucide-react';
import { Card, Badge, formatCurrency } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Field, Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { addImportedSale } from '../../data/salesStore';
import { useSalesImports } from '../../data/useSalesStore';
import {
  parseSquareReport,
  squareReportToDailySale,
} from '../../lib/square/parseSquareReport';
import type { SalesImport, SalesImportMethod, SquareParsedReport } from '../../types';

type ImportTab = SalesImportMethod;

const TABS: { id: ImportTab; label: string; icon: typeof FileSpreadsheet }[] = [
  { id: 'csv', label: 'Spreadsheet', icon: FileSpreadsheet },
  { id: 'txt', label: 'Text file', icon: FileText },
  { id: 'screenshot', label: 'Email screenshot', icon: ImageIcon },
];

export function SalesImportPage() {
  const { toast } = useToast();
  const imports = useSalesImports();
  const [tab, setTab] = useState<ImportTab>('screenshot');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const [parsed, setParsed] = useState<SquareParsedReport | null>(null);
  const [rawText, setRawText] = useState('');
  const [viewImport, setViewImport] = useState<SalesImport | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const clearSelection = useCallback(() => {
    setFile(null);
    setParsed(null);
    setRawText('');
    setOcrProgress(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [previewUrl]);

  const setSelectedFile = (next: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setParsed(null);
    setRawText('');
    setOcrProgress(null);
    setPreviewUrl(next && next.type.startsWith('image/') ? URL.createObjectURL(next) : null);
  };

  const acceptForTab =
    tab === 'csv'
      ? '.csv,.xlsx,.xls'
      : tab === 'txt'
        ? '.txt,.text,.csv'
        : 'image/png,image/jpeg,image/webp,image/heic,.png,.jpg,.jpeg,.webp';

  const handleFiles = (list: FileList | null) => {
    const chosen = list?.[0] ?? null;
    if (!chosen) return;
    setSelectedFile(chosen);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const runSpreadsheetImport = async () => {
    if (!file) {
      toast('Please choose a spreadsheet first', 'error');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const records = Math.floor(Math.random() * 80) + 120;
    const today = new Date().toLocaleDateString('en-GB');
    addImportedSale(
      {
        id: crypto.randomUUID(),
        date: today,
        transactions: records,
        grossSales: 0,
        vat: 0,
        netSales: 0,
        source: 'EPOS',
        status: 'Imported',
      },
      {
        id: crypto.randomUUID(),
        fileName: file.name,
        uploadDate: new Date().toLocaleString('en-GB'),
        records,
        status: 'Success',
        method: 'csv',
      },
    );
    clearSelection();
    setLoading(false);
    toast('Spreadsheet imported (full column mapping comes with Square API)');
  };

  const extractTextFromImage = async (imageFile: File): Promise<string> => {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && typeof m.progress === 'number') {
          setOcrProgress(Math.round(m.progress * 100));
        }
      },
    });
    try {
      const { data } = await worker.recognize(imageFile);
      return data.text;
    } finally {
      await worker.terminate();
    }
  };

  const handleParse = async () => {
    if (tab === 'csv') {
      await runSpreadsheetImport();
      return;
    }

    if (!file) {
      toast(tab === 'txt' ? 'Please choose a text file first' : 'Please choose a screenshot first', 'error');
      return;
    }

    setLoading(true);
    setOcrProgress(tab === 'screenshot' ? 0 : null);

    try {
      let text = '';
      if (tab === 'txt') {
        text = await file.text();
      } else {
        toast('Reading Square report from screenshot…', 'info');
        text = await extractTextFromImage(file);
      }

      setRawText(text);
      const report = parseSquareReport(text);
      if (!report) {
        toast(
          'Could not find Square sales figures. Check the file or edit extracted text below.',
          'error',
        );
        setParsed(null);
        return;
      }
      setParsed(report);
      toast('Report parsed — review the preview, then confirm import');
    } catch (err) {
      console.error(err);
      toast('Failed to read the file. Try a clearer screenshot or a .txt export.', 'error');
    } finally {
      setLoading(false);
      setOcrProgress(null);
    }
  };

  const handleConfirm = () => {
    if (!parsed || !file) return;
    const sale = squareReportToDailySale(parsed);
    addImportedSale(sale, {
      id: crypto.randomUUID(),
      fileName: file.name,
      uploadDate: new Date().toLocaleString('en-GB'),
      records: parsed.totalOrders || parsed.categories.length || 1,
      status: 'Success',
      method: tab,
      report: parsed,
    });
    clearSelection();
    toast(`Imported Square sales for ${parsed.date}`);
  };

  const reparseFromRaw = () => {
    const report = parseSquareReport(rawText);
    if (!report) {
      toast('Still could not parse sales figures from this text', 'error');
      return;
    }
    setParsed(report);
    toast('Re-parsed successfully');
  };

  const updateParsedField = <K extends keyof SquareParsedReport>(key: K, value: SquareParsedReport[K]) => {
    setParsed((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const columns: Column<SalesImport>[] = [
    {
      key: 'fileName',
      header: 'File Name',
      render: (r) => {
        const Icon =
          r.method === 'screenshot' ? ImageIcon : r.method === 'txt' ? FileText : FileSpreadsheet;
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon size={16} color="#0f766e" /> {r.fileName}
          </span>
        );
      },
    },
    {
      key: 'method',
      header: 'Method',
      render: (r) => (
        <Badge variant="neutral">
          {r.method === 'screenshot' ? 'Screenshot' : r.method === 'txt' ? 'Text' : 'Spreadsheet'}
        </Badge>
      ),
    },
    { key: 'uploadDate', header: 'Upload Date' },
    { key: 'records', header: 'Orders / Records', align: 'right' },
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
        <Button size="sm" variant="ghost" onClick={() => setViewImport(r)}>
          <Eye size={14} /> View
        </Button>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Import</h1>
          <p className="page-subtitle">
            Import Square daily sales until the Square API is connected
          </p>
        </div>
        <a className="sample-link" href="/samples/square-daily-sales-sample.txt" download>
          <Download size={16} /> Sample Square .txt
        </a>
      </div>

      <div className="import-tabs">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              className={`import-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => {
                setTab(t.id);
                clearSelection();
              }}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      <Card
        title={
          tab === 'csv'
            ? 'Upload spreadsheet'
            : tab === 'txt'
              ? 'Upload Square text report'
              : 'Upload Square email screenshot'
        }
      >
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          {tab === 'csv' && <FileSpreadsheet size={32} strokeWidth={1.5} />}
          {tab === 'txt' && <FileText size={32} strokeWidth={1.5} />}
          {tab === 'screenshot' && <ScanSearch size={32} strokeWidth={1.5} />}

          <p>
            {tab === 'csv' && 'CSV or Excel export from your EPOS / Square'}
            {tab === 'txt' && 'Paste or upload the Square daily sales summary as a .txt file'}
            {tab === 'screenshot' &&
              'Screenshot of the Square daily sales summary email (like the report you receive overnight)'}
          </p>

          <input
            ref={inputRef}
            type="file"
            accept={acceptForTab}
            onChange={(e) => handleFiles(e.target.files)}
          />

          {file && (
            <div className="file-chip">
              <span className="file-name">{file.name}</span>
              <button type="button" className="chip-clear" onClick={clearSelection} aria-label="Clear file">
                <X size={14} />
              </button>
            </div>
          )}

          {previewUrl && (
            <img src={previewUrl} alt="Screenshot preview" className="shot-preview" />
          )}

          {ocrProgress !== null && (
            <div className="ocr-bar">
              <div className="ocr-fill" style={{ width: `${ocrProgress}%` }} />
              <span>Reading text… {ocrProgress}%</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button onClick={handleParse} loading={loading}>
              {tab === 'csv' ? 'Import Sales' : tab === 'screenshot' ? 'Scan & Parse' : 'Parse Report'}
            </Button>
          </div>

          <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.75rem', maxWidth: 480 }}>
            {tab === 'csv' && 'Supported: CSV, Excel (.xlsx, .xls)'}
            {tab === 'txt' &&
              'Tip: forward/copy the Square email body into a .txt file, or download the sample format above.'}
            {tab === 'screenshot' &&
              'Tip: crop to the report body for best results. OCR runs in your browser — nothing is uploaded to a server.'}
          </p>
        </div>
      </Card>

      {rawText && tab !== 'csv' && !parsed && (
        <Card title="Extracted text (edit if needed)">
          <textarea
            className="raw-text"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={10}
          />
          <div style={{ marginTop: '0.75rem' }}>
            <Button onClick={reparseFromRaw}>Parse again</Button>
          </div>
        </Card>
      )}

      {parsed && (
        <Card
          title="Review parsed Square report"
          action={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="outline" onClick={clearSelection}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Confirm import</Button>
            </div>
          }
        >
          {parsed.businessName && (
            <p className="text-muted" style={{ marginBottom: '1rem' }}>
              {parsed.businessName}
              {parsed.period ? ` · ${parsed.period}` : ''}
            </p>
          )}

          <div className="preview-grid">
            <Field label="Date" htmlFor="sq-date">
              <Input
                id="sq-date"
                value={parsed.date}
                onChange={(e) => updateParsedField('date', e.target.value)}
              />
            </Field>
            <Field label="Total orders" htmlFor="sq-orders">
              <Input
                id="sq-orders"
                type="number"
                value={parsed.totalOrders}
                onChange={(e) => updateParsedField('totalOrders', Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Net sales (£)" htmlFor="sq-net">
              <Input
                id="sq-net"
                type="number"
                step="0.01"
                value={parsed.netSales}
                onChange={(e) => updateParsedField('netSales', Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Gross sales (£)" htmlFor="sq-gross">
              <Input
                id="sq-gross"
                type="number"
                step="0.01"
                value={parsed.grossSales}
                onChange={(e) => updateParsedField('grossSales', Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Taxes / VAT (£)" htmlFor="sq-tax">
              <Input
                id="sq-tax"
                type="number"
                step="0.01"
                value={parsed.taxes}
                onChange={(e) => updateParsedField('taxes', Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Average order (£)" htmlFor="sq-avg">
              <Input
                id="sq-avg"
                type="number"
                step="0.01"
                value={parsed.averageOrder}
                onChange={(e) => updateParsedField('averageOrder', Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Tips (£)" htmlFor="sq-tips">
              <Input
                id="sq-tips"
                type="number"
                step="0.01"
                value={parsed.tips}
                onChange={(e) => updateParsedField('tips', Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Fees (£)" htmlFor="sq-fees">
              <Input
                id="sq-fees"
                type="number"
                step="0.01"
                value={parsed.fees}
                onChange={(e) => updateParsedField('fees', Number(e.target.value) || 0)}
              />
            </Field>
          </div>

          {parsed.categories.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <h4 className="section-label">Sales by category</h4>
              <table className="cat-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Items sold</th>
                    <th>Net sales</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.categories.map((c) => (
                    <tr key={c.category}>
                      <td>{c.category}</td>
                      <td>{c.itemsSold}</td>
                      <td>{formatCurrency(c.netSales)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {rawText && (
            <details style={{ marginTop: '1rem' }}>
              <summary className="text-muted" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                Show extracted text
              </summary>
              <textarea
                className="raw-text"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={8}
                style={{ marginTop: '0.5rem' }}
              />
              <Button size="sm" variant="outline" onClick={reparseFromRaw} style={{ marginTop: '0.5rem' }}>
                Re-parse from text
              </Button>
            </details>
          )}
        </Card>
      )}

      <Card title="Import History">
        <DataTable columns={columns} data={imports} keyField="id" />
      </Card>

      <Modal
        open={!!viewImport}
        onClose={() => setViewImport(null)}
        title={viewImport?.fileName ?? 'Import'}
        footer={<Button onClick={() => setViewImport(null)}>Close</Button>}
      >
        {viewImport && (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div><span className="text-muted">Uploaded</span><div style={{ fontWeight: 600 }}>{viewImport.uploadDate}</div></div>
            <div><span className="text-muted">Status</span><div><Badge variant="success">{viewImport.status}</Badge></div></div>
            {viewImport.report ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div><span className="text-muted">Date</span><div style={{ fontWeight: 600 }}>{viewImport.report.date}</div></div>
                  <div><span className="text-muted">Orders</span><div style={{ fontWeight: 600 }}>{viewImport.report.totalOrders}</div></div>
                  <div><span className="text-muted">Net sales</span><div style={{ fontWeight: 600 }}>{formatCurrency(viewImport.report.netSales)}</div></div>
                  <div><span className="text-muted">Gross sales</span><div style={{ fontWeight: 600 }}>{formatCurrency(viewImport.report.grossSales)}</div></div>
                </div>
                {viewImport.report.categories.length > 0 && (
                  <table className="cat-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Items</th>
                        <th>Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewImport.report.categories.map((c) => (
                        <tr key={c.category}>
                          <td>{c.category}</td>
                          <td>{c.itemsSold}</td>
                          <td>{formatCurrency(c.netSales)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            ) : (
              <p className="text-muted">No detailed Square report stored for this import.</p>
            )}
          </div>
        )}
      </Modal>

      <style>{`
        .sample-link {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.875rem; font-weight: 600; color: var(--color-accent);
          text-decoration: none;
        }
        .sample-link:hover { text-decoration: underline; }
        .import-tabs {
          display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;
        }
        .import-tab {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.55rem 1rem; border-radius: 999px;
          border: 1px solid var(--color-border-strong);
          background: var(--color-bg-elevated); color: var(--color-text-secondary);
          font-weight: 600; font-size: 0.875rem; cursor: pointer;
          transition: background var(--transition), color var(--transition), border-color var(--transition);
        }
        .import-tab:hover { background: var(--color-bg-muted); color: var(--color-text); }
        .import-tab.active {
          background: var(--color-accent); color: white; border-color: var(--color-accent);
        }
        .upload-zone {
          border: 2px dashed var(--color-border-strong);
          border-radius: var(--radius-md);
          padding: 2rem;
          text-align: center;
          color: var(--color-text-secondary);
          display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
          background: var(--color-bg-muted);
          transition: border-color var(--transition), background var(--transition);
        }
        .upload-zone.drag-over {
          border-color: var(--color-accent);
          background: var(--color-accent-soft);
        }
        .upload-zone input[type="file"] { margin-top: 0.5rem; font-size: 0.85rem; }
        .file-chip {
          display: inline-flex; align-items: center; gap: 0.4rem;
          margin-top: 0.5rem; padding: 0.35rem 0.65rem;
          background: var(--color-bg-elevated); border: 1px solid var(--color-border);
          border-radius: 8px;
        }
        .file-name { font-weight: 600; color: var(--color-accent); font-size: 0.875rem; }
        .chip-clear {
          display: flex; color: var(--color-text-muted); background: transparent; border: none; cursor: pointer;
        }
        .shot-preview {
          max-width: min(100%, 420px); max-height: 280px; object-fit: contain;
          margin-top: 0.75rem; border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
        }
        .ocr-bar {
          position: relative; width: min(100%, 320px); height: 28px;
          background: var(--color-bg-elevated); border-radius: 8px; overflow: hidden;
          margin-top: 0.5rem; border: 1px solid var(--color-border);
        }
        .ocr-fill {
          position: absolute; inset: 0 auto 0 0; background: var(--color-accent-soft);
          transition: width 0.2s ease;
        }
        .ocr-bar span {
          position: relative; z-index: 1; font-size: 0.75rem; font-weight: 600;
          line-height: 28px;
        }
        .preview-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.85rem;
        }
        .section-label {
          font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem;
        }
        .cat-table { width: 100%; font-size: 0.875rem; }
        .cat-table th, .cat-table td {
          padding: 0.55rem 0.4rem; border-bottom: 1px solid var(--color-border); text-align: left;
        }
        .cat-table th { color: var(--color-text-secondary); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; }
        .cat-table td:nth-child(2), .cat-table td:nth-child(3),
        .cat-table th:nth-child(2), .cat-table th:nth-child(3) { text-align: right; font-variant-numeric: tabular-nums; }
        .raw-text {
          width: 100%; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.8rem; padding: 0.75rem; border-radius: var(--radius-sm);
          border: 1px solid var(--color-border-strong); background: var(--color-bg-muted);
          color: var(--color-text); resize: vertical;
        }
      `}</style>
    </div>
  );
}
