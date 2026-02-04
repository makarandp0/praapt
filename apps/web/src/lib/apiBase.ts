// API base URL - same server in prod, localhost:3000 in dev
export const API_BASE =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');
