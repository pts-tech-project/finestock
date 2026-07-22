import { useState } from 'react';
import { Building2, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Input';
import { useToast } from '../context/ToastContext';

export function CompanyProfilePage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: 'The Harbour Kitchen',
    tradingName: 'Harbour Kitchen',
    addressLine1: '12 Quay Street',
    addressLine2: '',
    city: 'Brighton',
    postcode: 'BN1 1AA',
    country: 'United Kingdom',
    phone: '01273 555 010',
    email: 'hello@harbourkitchen.co.uk',
    website: 'https://harbourkitchen.co.uk',
    vatNumber: 'GB123456789',
    companyNumber: '12345678',
    currency: 'GBP',
    financialYear: 'April – March',
    vatScheme: 'Standard',
    notes: '',
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Restaurant name is required';
    if (!form.vatNumber.trim()) next.vatNumber = 'VAT number is required';
    if (!form.email.trim()) next.email = 'Email is required';
    if (!form.addressLine1.trim()) next.addressLine1 = 'Address is required';
    if (!form.city.trim()) next.city = 'City is required';
    if (!form.postcode.trim()) next.postcode = 'Postcode is required';
    return next;
  };

  const handleSave = async () => {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      toast('Please fix the highlighted fields', 'error');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    toast('Company profile saved');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Profile</h1>
          <p className="page-subtitle">Restaurant details used across invoices, VAT and reports</p>
        </div>
        <Button onClick={handleSave} loading={saving}>Save Changes</Button>
      </div>

      <div className="profile-layout">
        <Card title="Business Identity">
          <div className="form-grid">
            <Field label="Restaurant Name" htmlFor="cp-name" error={errors.name}>
              <Input id="cp-name" value={form.name} onChange={(e) => update('name', e.target.value)} error={!!errors.name} />
            </Field>
            <Field label="Trading Name" htmlFor="cp-trading">
              <Input id="cp-trading" value={form.tradingName} onChange={(e) => update('tradingName', e.target.value)} />
            </Field>
            <Field label="VAT Number" htmlFor="cp-vat" error={errors.vatNumber}>
              <Input id="cp-vat" value={form.vatNumber} onChange={(e) => update('vatNumber', e.target.value)} error={!!errors.vatNumber} />
            </Field>
            <Field label="Company Number" htmlFor="cp-co">
              <Input id="cp-co" value={form.companyNumber} onChange={(e) => update('companyNumber', e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card title="Address">
          <div className="form-grid">
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Address Line 1" htmlFor="cp-a1" error={errors.addressLine1}>
                <Input id="cp-a1" value={form.addressLine1} onChange={(e) => update('addressLine1', e.target.value)} error={!!errors.addressLine1} />
              </Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Address Line 2" htmlFor="cp-a2">
                <Input id="cp-a2" value={form.addressLine2} onChange={(e) => update('addressLine2', e.target.value)} />
              </Field>
            </div>
            <Field label="City" htmlFor="cp-city" error={errors.city}>
              <Input id="cp-city" value={form.city} onChange={(e) => update('city', e.target.value)} error={!!errors.city} />
            </Field>
            <Field label="Postcode" htmlFor="cp-pc" error={errors.postcode}>
              <Input id="cp-pc" value={form.postcode} onChange={(e) => update('postcode', e.target.value)} error={!!errors.postcode} />
            </Field>
            <Field label="Country" htmlFor="cp-country">
              <Input id="cp-country" value={form.country} onChange={(e) => update('country', e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card title="Contact">
          <div className="form-grid">
            <Field label="Phone" htmlFor="cp-phone">
              <Input id="cp-phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </Field>
            <Field label="Email" htmlFor="cp-email" error={errors.email}>
              <Input id="cp-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} error={!!errors.email} />
            </Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Website" htmlFor="cp-web">
                <Input id="cp-web" value={form.website} onChange={(e) => update('website', e.target.value)} />
              </Field>
            </div>
          </div>
        </Card>

        <Card title="Financial Settings">
          <div className="form-grid">
            <Field label="Currency" htmlFor="cp-cur">
              <Select id="cp-cur" value={form.currency} onChange={(e) => update('currency', e.target.value)}>
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </Select>
            </Field>
            <Field label="Financial Year" htmlFor="cp-fy">
              <Select id="cp-fy" value={form.financialYear} onChange={(e) => update('financialYear', e.target.value)}>
                <option>April – March</option>
                <option>January – December</option>
              </Select>
            </Field>
            <Field label="VAT Scheme" htmlFor="cp-scheme">
              <Select id="cp-scheme" value={form.vatScheme} onChange={(e) => update('vatScheme', e.target.value)}>
                <option>Standard</option>
                <option>Flat Rate</option>
                <option>Cash Accounting</option>
              </Select>
            </Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Notes" htmlFor="cp-notes">
                <Textarea id="cp-notes" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Optional notes about the business..." />
              </Field>
            </div>
          </div>
        </Card>

        <Card title="Profile Summary" className="summary-card">
          <div className="summary">
            <div className="summary-icon"><Building2 size={22} /></div>
            <div>
              <h3>{form.name || 'Restaurant name'}</h3>
              {form.tradingName && <p className="text-muted">Trading as {form.tradingName}</p>}
            </div>
          </div>
          <ul className="summary-list">
            <li><MapPin size={15} /><span>{[form.addressLine1, form.city, form.postcode].filter(Boolean).join(', ') || 'Address not set'}</span></li>
            <li><Phone size={15} /><span>{form.phone || '—'}</span></li>
            <li><Mail size={15} /><span>{form.email || '—'}</span></li>
            <li><Globe size={15} /><span>{form.website || '—'}</span></li>
          </ul>
          <div className="summary-meta">
            <div><span className="text-muted">VAT</span><strong>{form.vatNumber || '—'}</strong></div>
            <div><span className="text-muted">Currency</span><strong>{form.currency}</strong></div>
            <div><span className="text-muted">Year End</span><strong>{form.financialYear}</strong></div>
          </div>
        </Card>
      </div>

      <style>{`
        .profile-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 1.25rem;
          align-items: start;
        }
        .profile-layout > :nth-child(1),
        .profile-layout > :nth-child(2),
        .profile-layout > :nth-child(3),
        .profile-layout > :nth-child(4) {
          grid-column: 1;
        }
        .summary-card { grid-column: 2; grid-row: 1 / span 2; position: sticky; top: calc(var(--header-height) + 1rem); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .summary { display: flex; gap: 0.85rem; align-items: flex-start; margin-bottom: 1.25rem; }
        .summary-icon {
          width: 44px; height: 44px; border-radius: 10px;
          background: var(--color-accent-soft); color: var(--color-accent);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .summary h3 { font-size: 1.05rem; font-weight: 700; }
        .summary-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem; }
        .summary-list li {
          display: flex; gap: 0.55rem; align-items: flex-start;
          font-size: 0.875rem; color: var(--color-text-secondary);
        }
        .summary-list svg { flex-shrink: 0; margin-top: 2px; color: var(--color-accent); }
        .summary-meta {
          display: flex; flex-direction: column; gap: 0.65rem;
          padding-top: 1rem; border-top: 1px solid var(--color-border);
        }
        .summary-meta > div { display: flex; justify-content: space-between; gap: 0.75rem; font-size: 0.875rem; }
        @media (max-width: 1000px) {
          .profile-layout { grid-template-columns: 1fr; }
          .profile-layout > * { grid-column: 1 !important; grid-row: auto !important; }
          .summary-card { position: static; }
        }
        @media (max-width: 560px) { .form-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
