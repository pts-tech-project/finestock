import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { DailySalesPage } from './pages/sales/DailySalesPage';
import { SalesImportPage } from './pages/sales/SalesImportPage';
import { ProductsPage } from './pages/ProductsPage';
import { RecipePage } from './pages/RecipePage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { StockMovementsPage } from './pages/inventory/StockMovementsPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage';
import { GoodsReceiptPage } from './pages/GoodsReceiptPage';
import { SupplierInvoicesPage } from './pages/SupplierInvoicesPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ReportsPage } from './pages/ReportsPage';
import { HmrcPage } from './pages/HmrcPage';
import { SettingsPage } from './pages/SettingsPage';
import { CompanyProfilePage } from './pages/CompanyProfilePage';
import { UsersPage } from './pages/UsersPage';
import { AuditPage } from './pages/AuditPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/sales/daily" element={<DailySalesPage />} />
                <Route path="/sales/import" element={<SalesImportPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id/recipe" element={<RecipePage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/inventory/movements" element={<StockMovementsPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
                <Route path="/goods-receipt" element={<GoodsReceiptPage />} />
                <Route path="/supplier-invoices" element={<SupplierInvoicesPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/hmrc" element={<HmrcPage />} />
                <Route path="/settings" element={<Navigate to="/settings/company" replace />} />
                <Route path="/settings/company" element={<CompanyProfilePage />} />
                <Route path="/settings/users" element={<UsersPage />} />
                <Route path="/settings/roles" element={<SettingsPage />} />
                <Route path="/audit" element={<AuditPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
