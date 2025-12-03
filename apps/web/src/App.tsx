import { useEffect, useState } from 'react';

import { ImageManager } from './components/ImageManager';
import { Button } from './components/ui/button';

export function App() {
  const [health, setHealth] = useState<string>('Checking...');
  const [faceHealth, setFaceHealth] = useState<string>('Checking...');
  // In production, API is at /api (same server). In dev, use VITE_API_URL or localhost:3000/api
  const api =
    import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

  useEffect(() => {
    console.log('Using API endpoint:', api);
    fetch(`${api}/health`)
      .then((r) => r.json())
      .then((d) => {
        setHealth(d.ok ? 'OK' : 'Not OK');
        setFaceHealth(d?.face?.ok ? 'OK' : 'Unavailable');
      })
      .catch((err) => {
        console.error('Health check failed:', err);
        setHealth('Unavailable');
        setFaceHealth('Unavailable');
      });
  }, [api]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Praapt Web</h1>
      <p className="text-sm text-gray-500">API Endpoint: {api}</p>
      <p>
        API: {health} • Face Service: {faceHealth}
      </p>
      <div className="flex gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
      </div>
      <div className="pt-8">
        <ImageManager apiBase={api} />
      </div>
    </div>
  );
}
