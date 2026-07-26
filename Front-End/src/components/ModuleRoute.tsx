import { Navigate, Outlet } from 'react-router-dom';
import { useModules } from '../context/ModuleContext';
import type { ModuleId } from '../types';

/** Ensures a module is selected and the account is entitled to it. */
export function ModuleRoute({ module }: { module: ModuleId }) {
  const { activeModule, hasAccess } = useModules();

  if (!activeModule) {
    return <Navigate to="/modules" replace />;
  }

  if (activeModule !== module) {
    return <Navigate to="/modules" replace />;
  }

  if (!hasAccess(module)) {
    return <Navigate to="/modules" replace />;
  }

  return <Outlet />;
}
