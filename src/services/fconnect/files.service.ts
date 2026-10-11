

import { FCONNECT_API_URL } from '../../config/env';


export const mediaUrl = (value: string | undefined | null, fallback = ''): string => {
  if (!value) return fallback;

  const trimmed = value.trim();
  if (!trimmed) return fallback;

 
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed;

 
  if (trimmed.startsWith('/api/')) return `${FCONNECT_API_URL.replace(/\/api$/, '')}${trimmed}`;

 
  if (trimmed.startsWith('assets/') || trimmed.startsWith('/assets/')) return trimmed;

  return `${FCONNECT_API_URL}/files/${trimmed.replace(/^\/+/, '')}`;
};
