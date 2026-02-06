import AppOptimized from './app/AppOptimized';

interface KioskFlowPageProps {
  apiBase: string;
}

export function KioskFlowPage({ apiBase }: KioskFlowPageProps) {
  return <AppOptimized apiBase={apiBase} />;
}
