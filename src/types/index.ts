import type { Permission, UserRole } from '../lib/roles';

export type { Permission, UserRole };

/**
 * Identifiant d'entité.
 *
 * Les données statiques de `src/data/` numérotent leurs entrées ; fconnect les
 * identifie par un ObjectId Mongo, une chaîne de 24 caractères. Les deux
 * cohabitent le temps de la bascule, et les comparaisons passent donc par
 * `String(a) === String(b)` plutôt que par une égalité stricte.
 */
export type EntityId = string | number;

export interface Player {
  id: EntityId;
  name: string;
  number: number;
  position: string;
  nationality: string;
  age: number;
  photo: string;
  stats: {
    matches: number;
    goals: number;
    assists: number;
  };
  biography: string;
  joinedYear: number;
}

/**
 * Rubriques et déclinaisons, énumérées plutôt que décrites.
 *
 * Les formulaires de l'administration en tirent leurs listes déroulantes, et le
 * backend valide les mêmes valeurs : une rubrique ajoutée ici doit l'être aussi
 * dans `server/src/models/`, sans quoi la saisie sera refusée.
 */
/**
 * Effectif — vocabulaire partagé avec `server/src/models/Player.model.ts`.
 *
 * Ces listes remplissent les menus de l'administration et le backend valide
 * les mêmes valeurs : une équipe ajoutée ici doit l'être aussi là-bas.
 */
/**
 * Équipes livrées avec le site.
 *
 * Ce n'est plus la liste des équipes possibles — le club les crée depuis
 * l'administration, et `Team.slug` fait foi. Elle reste le repli hors ligne et
 * la source des libellés d'origine.
 */
export const PLAYER_TEAMS = ['equipe-a', 'equipe-u19', 'equipe-u17', 'equipe-u15', 'equipe-u12'] as const;

/** Slug d'une équipe. Ouvert : une équipe créée aujourd'hui en a un nouveau. */
export type PlayerTeam = string;

/** Libellés d'équipe, pour l'affichage. */
export const PLAYER_TEAM_LABELS: Record<string, string> = {
  'equipe-a': 'Équipe A',
  'equipe-u19': 'U19',
  'equipe-u17': 'U17',
  'equipe-u15': 'U15',
  'equipe-u12': 'U12',
};

/** Ligne de jeu, dans l'ordre du terrain — c'est cet ordre qui sert au tri. */
export const PLAYER_LINES = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'] as const;
export type PlayerLine = (typeof PLAYER_LINES)[number];

export const PLAYER_KINDS = ['player', 'staff'] as const;
export type PlayerKind = (typeof PLAYER_KINDS)[number];

export const PLAYER_STATUSES = ['actif', 'blessé', 'suspendu', 'prêté', 'inactif'] as const;
export type PlayerStatus = (typeof PLAYER_STATUSES)[number];

export const STRONG_FEET = ['droit', 'gauche', 'les deux'] as const;
export type StrongFoot = (typeof STRONG_FEET)[number];

/** Fiche complète telle que le backend du site la rend. */
export interface TeamMember {
  id: string;
  kind: PlayerKind;
  name: string;
  team: PlayerTeam;
  number: number;
  line: PlayerLine;
  position: string;
  role: string;
  photo: string;
  status: PlayerStatus;
  birthDate: string | null;
  /** Calculé par le serveur à partir de `birthDate` ; 0 si elle est inconnue. */
  age: number;
  nationality: string;
  height: number;
  weight: number;
  strongFoot: StrongFoot | '';
  stats: { matches: number; goals: number; assists: number; yellowCards: number; redCards: number };
  biography: string;
  joinedYear: number;
  rank: number;
  isVisible: boolean;
}

export const ARTICLE_CATEGORIES = ['Matchs', 'Transferts', 'Équipe', 'Club'] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const PRODUCT_CATEGORIES = ['Maillots', 'Accessoires'] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_TYPES = ['Domicile', 'Extérieur', 'Third', 'Autre'] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const LEGEND_ERAS = ['Golden Age', 'Modern Era', 'Classic Era'] as const;
export type LegendEra = (typeof LEGEND_ERAS)[number];

export interface Article {
  id: EntityId;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: ArticleCategory;
  publishedAt: string;
  author: string;
  status?: 'draft' | 'published';
  comments: Comment[];
}

export interface Comment {
  id: EntityId;
  author: string;
  content: string;
  timestamp: string;
}

export interface Product {
  id: EntityId;
  name: string;
  price: number;
  category: ProductCategory;
  type: ProductType;
  image: string;
  images: string[];
  description: string;
  sizes: string[];
  inStock: boolean;
  /**
   * Visible sur la boutique.
   *
   * Retirer un produit de la vitrine sans le supprimer garde un sens aux
   * paniers qui le citent. Facultatif : les données statiques de repli, qui
   * précèdent le backend, ne le portent pas.
   */
  isVisible?: boolean;
}

/* ------------------------------------------------------------------ *
 * Commandes de la boutique
 * ------------------------------------------------------------------ */

export const ORDER_STATUSES = ['recue', 'preparee', 'remise', 'annulee'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const FULFILMENTS = ['retrait', 'livraison'] as const;
export type Fulfilment = (typeof FULFILMENTS)[number];

export const PAYMENT_METHODS = ['a_la_remise', 'mobile_money'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/**
 * Ligne de commande.
 *
 * Le nom et le prix unitaire sont ceux du jour de la commande, pas ceux du
 * catalogue d'aujourd'hui : une commande ancienne reste lisible telle qu'elle
 * a été passée, même si le produit a changé de prix ou disparu.
 */
export interface OrderItem {
  product?: string;
  name: string;
  unit_price: number;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  reference: string;
  customer: { name: string; phone: string; email?: string };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  fulfilment: Fulfilment;
  address?: string;
  payment_method: PaymentMethod;
  status: OrderStatus;
  note?: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export const TEAM_CATEGORIES = ['senior', 'youth'] as const;
export type TeamCategory = (typeof TEAM_CATEGORIES)[number];

/**
 * Équipe du club : équipe première ou catégorie de jeunes.
 *
 * `slug` est son identité durable — son adresse (`/teams/equipe-u19`) et la
 * clé que porte chaque fiche de l'effectif.
 */
export interface Team {
  id: EntityId;
  slug: string;
  name: string;
  category: TeamCategory;
  /** Tranche d'âge affichée en pastille : « Seniors », « 17–19 ». */
  ageRange: string;
  subtitle: string;
  description: string;
  coach: string;
  training: string;
  stadium: string;
  achievements: string[];
  stats: { wins: number; draws: number; losses: number };
  established: string;
  image: string;
  rank?: number;
  isVisible?: boolean;
}

/** Le club reçoit, ou se déplace. */
export const MATCH_VENUES = ['Domicile', 'Extérieur'] as const;
export type MatchVenue = (typeof MATCH_VENUES)[number];

export const MATCH_STATUSES = ['À venir', 'En cours', 'Terminé'] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export interface Match {
  id: EntityId;
  opponent: string;
  /** Jour de la rencontre, `AAAA-MM-JJ`. */
  date: string;
  /** Heure du coup d'envoi, `HH:MM`. */
  time: string;
  venue: MatchVenue;
  competition: string;
  /**
   * Score, une fois la rencontre jouée.
   *
   * `home` et `away` suivent l'affiche et non le club : à l'extérieur, le score
   * de Cambérène est `away`.
   *
   * `null` est accepté autant qu'absent : c'est ce que l'administration envoie
   * pour retirer un score, quand une rencontre repasse « À venir ».
   */
  result?: {
    home: number;
    away: number;
  } | null;
  status: MatchStatus;
}

export interface Subscription {
  id: number;
  category: 'Tribune' | 'Virage' | 'VIP';
  price: number;
  seat: string;
  benefits: string[];
}

export interface User {
  id: EntityId;
  name: string;
  email: string;
  role: UserRole;
  /**
   * Droits du compte, tels que le serveur les a rendus.
   *
   * Ils décident des écrans affichés, jamais de ce qui est permis : le serveur
   * revérifie chaque écriture. Voir `src/lib/roles.ts`.
   */
  permissions: Permission[];
  subscription?: Subscription;
  favoriteTeam?: string; // ajouté pour supporters
}

export interface Legend {
  id: number;
  name: string;
  position: string;
  period: string;
  nationality: string;
  photo: string;
  achievements: string[];
  stats: {
    matches: number;
    goals: number;
    assists: number;
    trophies: number;
  };
  biography: string;
  quote: string;
  jerseyNumber: number;
  era: LegendEra;
  isHallOfFame: boolean;
  /** Ordre d'affichage ; à défaut, le classement se fait par époque. */
  rank?: number;
}
/**
 * Étape de la frise historique du club.
 *
 * Vivait dans `src/data/history.ts` du temps où la frise était écrite en dur ;
 * elle rejoint les types partagés maintenant que le backend du site la sert.
 */
/**
 * Diapositive du carrousel de tête de l'accueil.
 *
 * Elle porte soit une photo, soit une vidéo YouTube : `youtube` l'emporte à
 * l'écran, `image` lui servant d'affiche puis de repli si la vidéo ne se
 * charge pas. Sans l'un ni l'autre, la diapositive s'affiche sur le fond vert
 * du club.
 */
export interface HeroSlide {
  id: EntityId;
  /** Photo de fond. Affiche de la vidéo quand `youtube` est renseigné. */
  image?: string;
  /** Identifiant ou lien YouTube, sous n'importe laquelle de ses formes. */
  youtube?: string;
  /** Surtitre jaune, en capitales. */
  kicker: string;
  /** Titre blanc, en capitales, sur trois lignes au plus. */
  title: string;
  link: string;
  linkLabel: string;
  /** Ordre d'apparition : les petits nombres passent devant. */
  rank?: number;
  isVisible?: boolean;
}

export interface HistoryEvent {
  id: EntityId;
  /** Année pivot, celle qui range l'étape dans la frise. */
  year: number;
  /** Précision libre quand l'année ne suffit pas : « Mai 1974 », « 1974-1976 ». */
  dateLabel?: string;
  title: string;
  description: string;
  tags?: string[];
  image?: string;
  /** Ère à laquelle l'étape appartient : Fondation, Expansion, Modernisation… */
  phase?: string;
}
