import { Link } from 'react-router-dom';
import { ExternalLink, Building2, FileText, Wallet } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const links = [
  {
    title: 'Corporation Tax',
    path: '/hmrc/corporation-tax',
    href: 'https://www.gov.uk/corporation-tax',
    icon: Building2,
    blurb: 'Tax on company profits for an accounting period — trading profits, investments and chargeable gains.',
  },
  {
    title: 'VAT Return',
    path: '/hmrc/vat-return',
    href: 'https://www.gov.uk/browse/tax/vat',
    icon: FileText,
    blurb: 'Register, charge, reclaim and submit VAT — including Making Tax Digital returns.',
  },
  {
    title: 'PAYE',
    path: '/hmrc/paye',
    href: 'https://www.gov.uk/paye-online',
    icon: Wallet,
    blurb: 'PAYE Online for employers — check what you owe, pay HMRC and view employee notices.',
  },
];

export function HmrcOverviewPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">HMRC</h1>
          <p className="page-subtitle">
            Manage Corporation Tax, VAT and PAYE using HMRC guidance and MTD-ready workflows
          </p>
        </div>
      </div>

      <div className="hmrc-overview-grid">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.path}>
              <div className="hmrc-card">
                <span className="hmrc-card-icon"><Icon size={20} /></span>
                <h2>{item.title}</h2>
                <p>{item.blurb}</p>
                <div className="hmrc-card-actions">
                  <Link to={item.path}><Button size="sm">Open</Button></Link>
                  <a href={item.href} target="_blank" rel="noreferrer" className="gov-link">
                    GOV.UK <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <style>{`
        .hmrc-overview-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }
        .hmrc-card { display: flex; flex-direction: column; gap: 0.65rem; min-height: 180px; }
        .hmrc-card-icon {
          width: 40px; height: 40px; border-radius: 8px;
          background: var(--color-accent-soft); color: var(--color-accent);
          display: flex; align-items: center; justify-content: center;
        }
        .hmrc-card h2 { font-size: 1.05rem; margin: 0; }
        .hmrc-card p { font-size: 0.875rem; color: var(--color-text-secondary); flex: 1; margin: 0; }
        .hmrc-card-actions { display: flex; align-items: center; gap: 0.85rem; margin-top: 0.35rem; }
        .gov-link {
          display: inline-flex; align-items: center; gap: 0.25rem;
          font-size: 0.8rem; font-weight: 600; color: var(--color-accent-text);
        }
        .gov-link:hover { text-decoration: underline; }
        @media (max-width: 900px) {
          .hmrc-overview-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
