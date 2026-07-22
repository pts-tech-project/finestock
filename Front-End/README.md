# FinStock — Restaurant Finance & Inventory

Modern React frontend for restaurant finance, inventory, purchasing, expenses, VAT reporting, and HMRC integration.

## Stack

- React 19 + TypeScript
- Vite
- React Router
- Recharts
- Lucide icons

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Demo login

- Email: `john@restaurant.com` (or any email)
- Password: `demo` (any password with 4+ characters)

## Modules

| Route | Page |
|-------|------|
| `/login` | Authentication |
| `/dashboard` | Owner overview |
| `/sales/daily` | Daily EPOS sales |
| `/sales/import` | Sales file import |
| `/products` | Product management |
| `/products/:id/recipe` | Recipe costing |
| `/inventory` | Stock items |
| `/inventory/movements` | Stock movements |
| `/suppliers` | Suppliers |
| `/purchase-orders` | Purchase orders |
| `/goods-receipt` | Goods receipt |
| `/supplier-invoices` | Supplier invoices |
| `/expenses` | Expenses |
| `/reports` | Financial reports |
| `/hmrc` | HMRC VAT |
| `/settings` | Company, users, roles |
| `/audit` | Audit logs |

Data is currently mocked in `src/data/mockData.ts` for frontend development.
