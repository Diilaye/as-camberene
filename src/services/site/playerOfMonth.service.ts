import { siteApi } from '../../lib/api';
import { siteMediaUrl } from './media';

export interface PotmNominee {
  id: string;
  name: string;
  photo: string;
  number: number;
  line: string;
  position: string;
}

/** L'élection telle que le public la voit : ni décompte, ni classement. */
export interface PotmCurrent {
  id: string;
  month: string;
  title: string;
  status: 'open' | 'closed';
  nominees: PotmNominee[];
  /** Joueur pour qui le compte connecté a voté. */
  myVote: string | null;
  /** Vainqueur, révélé à la clôture seulement. */
  winner: string | null;
}

/** L'élection vue par l'administration, dépouillement compris. */
export interface PotmAdmin {
  id: string;
  month: string;
  title: string;
  status: 'open' | 'closed';
  totalVotes: number;
  results: (PotmNominee & { votes: number })[];
}

const withPhoto = <T extends PotmNominee>(nominee: T): T => ({ ...nominee, photo: siteMediaUrl(nominee.photo) });

export const getCurrentPotm = async (signal?: AbortSignal): Promise<PotmCurrent | null> => {
  const response = await siteApi.get<{ data: PotmCurrent | null }>('/player-of-month/current', { auth: true, signal });
  return response.data ? { ...response.data, nominees: response.data.nominees.map(withPhoto) } : null;
};

export const votePotm = async (pollId: string, player: string): Promise<void> => {
  await siteApi.post(`/player-of-month/${pollId}/vote`, { player }, { auth: true });
};

export const listPotm = async (signal?: AbortSignal): Promise<PotmAdmin[]> => {
  const response = await siteApi.get<{ data: PotmAdmin[] }>('/player-of-month', { auth: true, signal });
  return response.data.map((poll) => ({ ...poll, results: poll.results.map(withPhoto) }));
};

export const createPotm = (payload: { month: string; title: string; nominees: string[]; status: 'open' | 'closed' }) =>
  siteApi.post('/player-of-month', payload, { auth: true });

export const updatePotm = (id: string, payload: Partial<{ title: string; nominees: string[]; status: 'open' | 'closed' }>) =>
  siteApi.put(`/player-of-month/${id}`, payload, { auth: true });

export const deletePotm = (id: string) => siteApi.del(`/player-of-month/${id}`, { auth: true });

/** « 2026-09 » → « Septembre 2026 ». */
export const monthName = (month: string): string => {
  const label = new Date(`${month}-15T12:00:00`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};
