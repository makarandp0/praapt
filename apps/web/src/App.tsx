import { StatusPanel } from './components/StatusPanel';
import { Library } from './pages/Library';

export function App() {
  // In production, API is at /api (same server). In dev, use VITE_API_URL or localhost:3000/api
  const api =
    import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Praapt Web</h1>
        <StatusPanel apiBase={api} />
      </div>
      <div className="pt-4">
        <Library apiBase={api} />
      </div>
    </div>
  );
}
