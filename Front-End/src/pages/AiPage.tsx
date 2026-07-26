import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

export function AiPage() {
  const { toast } = useToast();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Assistant</h1>
          <p className="page-subtitle">AI insights and automation for FinStock (add-on module)</p>
        </div>
      </div>

      <Card title="Coming soon">
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', maxWidth: 520 }}>
          The AI system will be defined here in a later update. This module stays locked until it is
          included in your plan.
        </p>
        <Button variant="outline" onClick={() => toast('AI features will be shared soon', 'info')}>
          Placeholder reserved
        </Button>
      </Card>
    </div>
  );
}
