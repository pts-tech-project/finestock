import { ExternalLink } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

/**
 * Guided by GOV.UK Corporation Tax overview:
 * https://www.gov.uk/corporation-tax
 */
export function CorporationTaxPage() {
  const { toast } = useToast();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Corporation Tax</h1>
          <p className="page-subtitle">
            Tax your company pays to HMRC on profits in an accounting period
          </p>
        </div>
        <a href="https://www.gov.uk/corporation-tax" target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm">
            GOV.UK guide <ExternalLink size={14} />
          </Button>
        </a>
      </div>

      <div className="grid-2">
        <Card title="Who pays">
          <ul className="ct-list">
            <li>Limited companies</li>
            <li>Foreign companies with a UK branch or office</li>
            <li>Clubs, co-operatives and other unincorporated associations</li>
          </ul>
          <p className="text-muted" style={{ marginTop: '0.85rem', fontSize: '0.875rem' }}>
            You do not get a bill for Corporation Tax — you must work out, pay and report it yourself.
          </p>
        </Card>

        <Card title="Profits you pay on">
          <ul className="ct-list">
            <li>Trading profits from doing business</li>
            <li>Investments</li>
            <li>Chargeable gains (selling assets for more than they cost)</li>
          </ul>
          <p className="text-muted" style={{ marginTop: '0.85rem', fontSize: '0.875rem' }}>
            UK-resident companies pay on UK and worldwide profits. Non-resident companies with a UK
            branch only pay on UK activities.
          </p>
        </Card>
      </div>

      <Card title="Register & manage">
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Register the company with Companies House and set up Corporation Tax (at registration or
          later via your business tax account). Dormant companies that are not doing business are
          usually dormant for Corporation Tax.
        </p>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <Button onClick={() => toast('Corporation Tax period setup coming soon', 'info')}>
            Set up accounting period
          </Button>
          <Button variant="outline" onClick={() => toast('Profit estimate worksheet coming soon', 'info')}>
            Estimate taxable profits
          </Button>
        </div>
      </Card>

      <style>{`
        .ct-list {
          margin: 0; padding-left: 1.15rem;
          display: flex; flex-direction: column; gap: 0.45rem;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
