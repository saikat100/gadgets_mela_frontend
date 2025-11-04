export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export function api(path: string): string {
  if (!path.startsWith('/')) return `${API_BASE}/${path}`;
  return `${API_BASE}${path}`;
}


