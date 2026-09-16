/**
 * Formes du jeu de donnees d'amorcage.
 *
 * Volontairement decrites ici plutot qu'importees des modeles Mongoose : le
 * jeu de donnees dit ce qu'un redacteur saisirait, pas ce que la base stocke.
 * Les valeurs par defaut, les dates de creation, les identifiants sont l'affaire
 * du modele.
 */

export interface SeedComment {
  author: string;
  content: string;
  /** Jours ecoules depuis la parution de l'article. */
  daysAfter: number;
}

export interface SeedArticle {
  title: string;
  excerpt: string;
  content: string;
  category: 'Matchs' | 'Transferts' | 'Équipe' | 'Club';
  author: string;
  /** Date de parution, `AAAA-MM-JJ`. */
  publishedAt: string;
  status: 'draft' | 'published';
  image: string;
  comments?: SeedComment[];
}

export interface SeedProduct {
  name: string;
  /** En francs CFA, entier : la devise n'a pas de sous-unite. */
  price: number;
  category: 'Maillots' | 'Accessoires';
  type: 'Domicile' | 'Extérieur' | 'Third' | 'Autre';
  description: string;
  sizes: string[];
  image: string;
  inStock: boolean;
  isVisible?: boolean;
}

export interface SeedLegend {
  name: string;
  position: string;
  period: string;
  nationality: string;
  photo: string;
  achievements: string[];
  stats: { matches: number; goals: number; assists: number; trophies: number };
  biography: string;
  quote: string;
  jerseyNumber: number;
  era: 'Golden Age' | 'Modern Era' | 'Classic Era';
  isHallOfFame: boolean;
  rank: number;
}

export interface SeedHistoryEvent {
  year: number;
  dateLabel?: string;
  title: string;
  description: string;
  tags: string[];
  phase: string;
}

export interface SeedHeroSlide {
  /** Photo de fond. Affiche de la vidéo quand `youtube` est renseigné. */
  image?: string;
  /** Lien ou identifiant YouTube : la diapositive devient alors une vidéo. */
  youtube?: string;
  kicker: string;
  title: string;
  link: string;
  linkLabel: string;
  /** Ordre d'apparition : les petits nombres passent devant. */
  rank: number;
}

export interface SeedMatch {
  opponent: string;
  /** Jour de la rencontre, `AAAA-MM-JJ`. */
  date: string;
  /** Heure du coup d'envoi, `HH:MM`. */
  time: string;
  venue: 'Domicile' | 'Extérieur';
  competition: string;
  /** Absent tant que la rencontre n'est pas jouée. */
  result?: { home: number; away: number };
  status: 'À venir' | 'En cours' | 'Terminé';
}

export interface SeedGalleryItem {
  image: string;
  title: string;
  description: string;
  category: 'match' | 'entrainement' | 'club';
  /** Jour de la prise de vue, `AAAA-MM-JJ`. */
  date: string;
}
