import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ModuleProvider } from './context/ModuleContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ModuleRoute } from './components/ModuleRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ModulesPage } from './pages/ModulesPage';
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
import { HmrcOverviewPage } from './pages/hmrc/HmrcOverviewPage';
import { CorporationTaxPage } from './pages/hmrc/CorporationTaxPage';
import { VatReturnPage } from './pages/hmrc/VatReturnPage';
import { PayePage } from './pages/hmrc/PayePage';
import { PayrollDashboardPage } from './pages/payroll/PayrollDashboardPage';
import { PayrollEmployeesPage } from './pages/payroll/PayrollEmployeesPage';
import { PayrollEmployeeProfilePage } from './pages/payroll/PayrollEmployeeProfilePage';
import { TimesheetsPage } from './pages/payroll/TimesheetsPage';
import { PayrollRunsPage } from './pages/payroll/PayrollRunsPage';
import { CreatePayrollPage } from './pages/payroll/CreatePayrollPage';
import { PayrollRunDetailPage } from './pages/payroll/PayrollRunDetailPage';
import { PayslipsPage } from './pages/payroll/PayslipsPage';
import { PayrollReportsPage } from './pages/payroll/PayrollReportsPage';
import { AiPage } from './pages/AiPage';
import { SettingsPage } from './pages/SettingsPage';
import { CompanyProfilePage } from './pages/CompanyProfilePage';
import { UsersPage } from './pages/UsersPage';
import { AuditPage } from './pages/AuditPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ModuleProvider>
            <ToastProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/modules" element={<ModulesPage />} />

                  <Route element={<MainLayout />}>
                    <Route element={<ModuleRoute module="core" />}>
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
                      <Route path="/settings" element={<Navigate to="/settings/company" replace />} />
                      <Route path="/settings/company" element={<CompanyProfilePage />} />
                      <Route path="/settings/users" element={<UsersPage />} />
                      <Route path="/settings/roles" element={<SettingsPage />} />
                      <Route path="/audit" element={<AuditPage />} />
                    </Route>

                    <Route element={<ModuleRoute module="hmrc" />}>
                      <Route path="/hmrc" element={<HmrcOverviewPage />} />
                      <Route path="/hmrc/corporation-tax" element={<CorporationTaxPage />} />
                      <Route path="/hmrc/vat-return" element={<VatReturnPage />} />
                      <Route path="/hmrc/paye" element={<PayePage />} />
                    </Route>

                    <Route element={<ModuleRoute module="payroll" />}>
                      <Route path="/payroll" element={<PayrollDashboardPage />} />
                      <Route path="/payroll/employees" element={<PayrollEmployeesPage />} />
                      <Route path="/payroll/employees/:id" element={<PayrollEmployeeProfilePage />} />
                      <Route path="/payroll/timesheets" element={<TimesheetsPage />} />
                      <Route path="/payroll/runs" element={<PayrollRunsPage />} />
                      <Route path="/payroll/runs/new" element={<CreatePayrollPage />} />
                      <Route path="/payroll/runs/:id" element={<PayrollRunDetailPage />} />
                      <Route path="/payroll/payslips" element={<PayslipsPage />} />
                      <Route path="/payroll/reports" element={<PayrollReportsPage />} />
                    </Route>

                    <Route element={<ModuleRoute module="ai" />}>
                      <Route path="/ai" element={<AiPage />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/modules" replace />} />
              </Routes>
            </ToastProvider>
          </ModuleProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
