import AppOptimized from './app/AppOptimized';

interface KioskFlowPageProps {
  apiBase: string;
}

export function KioskFlowPage({ apiBase }: KioskFlowPageProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-neutral-900">Praapt Kiosk Flow</h1>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <AppOptimized apiBase={apiBase} />
      </div>
    </div>
  );
}
