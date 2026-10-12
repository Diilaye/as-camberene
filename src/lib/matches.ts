import { Match } from '../types';

export const kickoff = (match: Match): number => new Date(`${match.date}T${match.time || '00:00'}:00`).getTime();

export const isOver = (match: Match): boolean => match.status === 'Terminé';

export const upcomingMatches = (matches: Match[], count: number): Match[] =>
  matches
    .filter((match) => !isOver(match))
    .sort((a, b) => kickoff(a) - kickoff(b))
    .slice(0, count);

export const recentResults = (matches: Match[], count: number): Match[] =>
  matches
    .filter((match) => isOver(match))
    .sort((a, b) => kickoff(b) - kickoff(a))
    .slice(0, count);
