import { useEffect, useState } from 'react';

import { Button } from './components/ui/button';

export function App() {
  const [health, setHealth] = useState<string>('Checking...');
  const api = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetch(`${api}/health`)
      .then((r) => r.json())
      .then((d) => setHealth(d.ok ? 'OK' : 'Not OK'))
      .catch(() => setHealth('Unavailable'));
  }, [api]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Praapt Web</h1>
      <p>API Health: {health}</p>
      <div className="flex gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
      </div>
    </div>
  );
}
