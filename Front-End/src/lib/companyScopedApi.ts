export function getAuthenticatedCompanyId(): string {
  try {
    const stored = localStorage.getItem('finstock_user');
    const companyId = stored ? (JSON.parse(stored) as { companyId?: string | null }).companyId : null;
    if (companyId) return companyId;
  } catch {
    // An invalid cached session will be cleared by AuthContext.
  }

  const developmentCompanyId = import.meta.env.VITE_COMPANY_ID as string | undefined;
  if (developmentCompanyId && developmentCompanyId !== 'replace-with-your-company-id') {
    return developmentCompanyId;
  }
  throw new Error('The logged-in user is not assigned to a restaurant');
}

export function companyApiPath(resource: string): string {
  return `/api/companies/${getAuthenticatedCompanyId()}/${resource.replace(/^\//, '')}`;
}
