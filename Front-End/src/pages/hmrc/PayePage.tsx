import { ExternalLink } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

/**
 * Guided by GOV.UK PAYE Online for employers:
 * https://www.gov.uk/paye-online
 */
export function PayePage() {
  const { toast } = useToast();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">PAYE</h1>
          <p className="page-subtitle">
            PAYE Online for employers — check what you owe, pay HMRC and manage employee notices
          </p>
        </div>
        <a href="https://www.gov.uk/paye-online" target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm">
            GOV.UK PAYE Online <ExternalLink size={14} />
          </Button>
        </a>
      </div>

      <div className="grid-2">
        <Card title="What you can do">
          <ul className="paye-list">
            <li>Check what you owe HMRC and pay your bill</li>
            <li>See your payment history</li>
            <li>Access tax codes and notices about employees</li>
            <li>Appeal a penalty</li>
            <li>Get alerts for late reporting or payment</li>
            <li>Send expenses and benefits returns (P11D, P46 car, and related forms)</li>
          </ul>
        </Card>

        <Card title="Before you start">
          <ol className="paye-list">
            <li>Register as an employer</li>
            <li>Enrol for PAYE Online</li>
            <li>Activate the service with the code HMRC sends by post</li>
          </ol>
          <p className="text-muted" style={{ marginTop: '0.85rem', fontSize: '0.875rem' }}>
            If you registered as an employer online you are enrolled automatically. Activate within
            28 days of the letter date.
          </p>
        </Card>
      </div>

      <Card title="Tax codes & notices">
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          HMRC sends employer notices through PAYE Online, including tax code notices (P6 / P9),
          student loan notices (SL1 / SL2), National Insurance verification notices, and late
          reporting or payment alerts.
        </p>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <Button onClick={() => toast('PAYE connection flow coming soon', 'info')}>
            Connect PAYE Online
          </Button>
          <Button variant="outline" onClick={() => toast('Notice inbox coming soon', 'info')}>
            View notices
          </Button>
        </div>
      </Card>

      <style>{`
        .paye-list {
          margin: 0; padding-left: 1.15rem;
          display: flex; flex-direction: column; gap: 0.45rem;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
