import { Loading } from './ui/Card';

export function AuthLoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loading />
    </div>
  );
}
