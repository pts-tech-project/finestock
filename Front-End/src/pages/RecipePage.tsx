import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Card, formatCurrency } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Field, Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { mockProducts, mockRecipe } from '../data/mockData';
import type { RecipeIngredient } from '../types';

export function RecipePage() {
  const { id } = useParams();
  const { toast } = useToast();
  const product = mockProducts.find((p) => p.id === id) ?? mockProducts[0];
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(mockRecipe);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState('');

  const totalCost = ingredients.reduce((sum, i) => sum + i.cost, 0);
  const sellingPrice = product.sellingPrice ?? 0;
  const profit = sellingPrice - totalCost;
  const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  const addIngredient = () => {
    if (!name.trim() || !quantity.trim()) {
      toast('Name and quantity are required', 'error');
      return;
    }
    setIngredients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, quantity, cost: Number(cost) || 0 },
    ]);
    setName('');
    setQuantity('');
    setCost('');
    setModalOpen(false);
    toast('Ingredient added');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/products" className="back-link">
            <ArrowLeft size={16} /> Back to Products
          </Link>
          <h1 className="page-title" style={{ marginTop: '0.5rem' }}>{product.name}</h1>
          <p className="page-subtitle">Recipe & ingredient costing</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Add Ingredient
          </Button>
          <Button onClick={() => toast('Recipe saved')}>Save Recipe</Button>
        </div>
      </div>

      <div className="grid-2">
        <Card title="Ingredients">
          <div className="ingredient-list">
            {ingredients.map((ing) => (
              <div key={ing.id} className="ingredient-row">
                <div>
                  <div className="ing-name">{ing.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>{ing.quantity}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="ing-cost">{formatCurrency(ing.cost)}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIngredients((prev) => prev.filter((i) => i.id !== ing.id));
                      toast('Ingredient removed', 'info');
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
            {ingredients.length === 0 && (
              <p className="text-muted" style={{ padding: '1rem 0' }}>No ingredients yet. Add one to start costing.</p>
            )}
          </div>
        </Card>

        <Card title="Cost Summary">
          <div className="cost-summary">
            <div className="cost-row">
              <span>Total Cost</span>
              <strong>{formatCurrency(totalCost)}</strong>
            </div>
            <div className="cost-row">
              <span>Selling Price</span>
              <strong>{formatCurrency(sellingPrice)}</strong>
            </div>
            <div className="cost-row profit">
              <span>Profit</span>
              <strong>{formatCurrency(profit)}</strong>
            </div>
            <div className="margin-bar">
              <div
                className="margin-fill"
                style={{ width: `${Math.max(0, Math.min(100, margin))}%` }}
              />
            </div>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Gross margin: {margin.toFixed(1)}%
            </p>
          </div>
        </Card>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Ingredient"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={addIngredient}>Add</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Ingredient Name" htmlFor="ing-name">
            <Input id="ing-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chicken Breast" />
          </Field>
          <Field label="Quantity" htmlFor="ing-qty">
            <Input id="ing-qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 150g" />
          </Field>
          <Field label="Cost (£)" htmlFor="ing-cost">
            <Input id="ing-cost" type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <style>{`
        .back-link {
          display: inline-flex; align-items: center; gap: 0.35rem;
          font-size: 0.85rem; color: var(--color-accent); font-weight: 600;
        }
        .ingredient-list { display: flex; flex-direction: column; }
        .ingredient-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.85rem 0;
          border-bottom: 1px solid var(--color-border);
        }
        .ingredient-row:last-child { border-bottom: none; }
        .ing-name { font-weight: 600; }
        .ing-cost { font-variant-numeric: tabular-nums; font-weight: 600; }
        .cost-summary { display: flex; flex-direction: column; gap: 1rem; }
        .cost-row { display: flex; justify-content: space-between; font-size: 1rem; }
        .cost-row.profit { padding-top: 0.75rem; border-top: 1px solid var(--color-border); color: var(--color-success); font-size: 1.15rem; }
        .margin-bar { height: 8px; background: var(--color-bg-muted); border-radius: 4px; overflow: hidden; margin-top: 0.5rem; }
        .margin-fill { height: 100%; background: var(--color-accent); border-radius: 4px; }
      `}</style>
    </div>
  );
}
