import teamHero from '../../assets/img/asc-camberene-equipe-2025.webp';

export interface TeamData {
  id: string;
  category: 'senior' | 'youth';
  name: string;
  ageRange: string;
  subtitle: string;
  description: string;
  players: number;
  coach: string;
  training: string;
  stadium: string;
  achievements: string[];
  stats: { wins: number; draws: number; losses: number };
  established: string;
  image: string;
}

export const teamsData: TeamData[] = [
  {
    id: 'equipe-a', category: 'senior', name: 'ÉQUIPE A', ageRange: 'Seniors', subtitle: 'Groupe Elite',
    description: 'Performance & identité du club.', players: 25, coach: 'Mamadou Diallo', training: 'Lun · Mer · Ven — 17h00', stadium: 'Stade Léopold Senghor',
    achievements: ['Champion 2023', 'Finale 2024'], stats: { wins: 18, draws: 4, losses: 2 }, established: '1965', image: teamHero
  },
  {
    id: 'equipe-u19', category: 'youth', name: 'U19', ageRange: '17–19', subtitle: 'Transition',
    description: 'Préparation haut niveau.', players: 22, coach: 'Ibrahima Sarr', training: 'Mar · Jeu · Sam — 16h00',
    stadium: 'Centre de Formation', achievements: ['Champion 2024'], stats: { wins: 15, draws: 3, losses: 2 }, established: '1985', image: teamHero
  },
  {
    id: 'equipe-u17', category: 'youth', name: 'U17', ageRange: '15–17', subtitle: 'Avancée',
    description: 'Tactique & discipline.', players: 20, coach: 'Ousmane Ba', training: 'Lun · Mer · Sam — 15h30',
    stadium: "Terrain d'entraînement", achievements: ['Défense 2024'], stats: { wins: 12, draws: 5, losses: 3 }, established: '1990', image: teamHero
  },
  {
    id: 'equipe-u15', category: 'youth', name: 'U15', ageRange: '13–15', subtitle: 'Base',
    description: 'Bases techniques.', players: 18, coach: 'Abdoulaye Ndiaye', training: 'Mar · Jeu · Sam — 15h00',
    stadium: "Terrain d'entraînement", achievements: ['Champion 2024'], stats: { wins: 14, draws: 4, losses: 2 }, established: '1995', image: teamHero
  },
  {
    id: 'equipe-u12', category: 'youth', name: 'U12', ageRange: '10–12', subtitle: 'Éveil',
    description: 'Jeu & plaisir.', players: 16, coach: 'Fatou Seck', training: 'Mer · Sam — 14h30',
    stadium: "Terrain d'entraînement", achievements: ['Festival 2024'], stats: { wins: 10, draws: 6, losses: 4 }, established: '2000', image: teamHero
  }
];

export const getTeamById = (id: string) => teamsData.find(t => t.id === id);
