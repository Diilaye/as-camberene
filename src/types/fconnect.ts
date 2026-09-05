/**
 * Formes renvoyées par la gateway fconnect.
 *
 * Ce fichier décrit le backend tel qu'il répond, sans arrangement : les noms de
 * champs y sont ceux de fconnect (`snake_case` côté auth-service, `camelCase`
 * côté match/marketplace — la divergence est dans le backend, pas ici). La
 * traduction vers les types du site vit dans `src/adapters/`.
 */

// ==========================================================================
// Enveloppes
// ==========================================================================

export interface FcPagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  pages?: number;
}

/** auth-service : `{ success, data }`. */
export interface FcDataResponse<T> {
  success: boolean;
  data: T;
  pagination?: FcPagination;
  message?: string;
}

/** match-service : `{ success, matches }`. */
export interface FcMatchesResponse {
  success: boolean;
  matches: FcMatch[];
  pagination?: FcPagination;
}

/** marketplace-service : `{ success, products }`. */
export interface FcProductsResponse {
  success: boolean;
  products: FcProduct[];
  pagination?: FcPagination;
}

// ==========================================================================
// Club
// ==========================================================================

export interface FcClub {
  id: string;
  user_id: string;
  name: string;
  founded_year?: number;
  description?: string;
  logo_url?: string;
  cover_photo_url?: string;
  club_type?: 'amateur' | 'semi-professional' | 'professional' | 'academy';
  address?: string;
  city?: string;
  country?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  members_count: number;
  followers_count: number;
  is_verified: boolean;
  /** Ancienneté calculée par le backend, `null` si l'année est inconnue. */
  age: number | null;
  created_at: string;
  updated_at: string;
}

// ==========================================================================
// Équipes et membres
// ==========================================================================

export type FcTeamCategory =
  | 'senior' | 'u23' | 'u19' | 'u17' | 'u15' | 'u13' | 'u11'
  | 'veterans' | 'women' | 'other';

export type FcMemberRole =
  | 'player' | 'coach' | 'analyst' | 'set_piece_coach' | 'scout' | 'staff'
  | 'medical' | 'admin' | 'treasurer' | 'registrar' | 'communication'
  | 'adherent' | 'parent';

export type FcMemberStatus = 'active' | 'inactive' | 'suspended' | 'trial' | 'injured' | 'loaned';

/**
 * Membre tel que peuplé dans une équipe.
 *
 * `GET /api/clubs/:clubId/teams` ne projette que ces champs — c'est la seule
 * vue de l'effectif que fconnect expose sans authentification, et la seule que
 * ce site doit utiliser. Cf. `members.service.ts`.
 */
export interface FcTeamPlayerRef {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number?: number;
  position?: string;
  profile_picture_url?: string;
  /** Présents sur `GET /api/clubs/teams/:teamId` uniquement. */
  date_of_birth?: string;
  status?: FcMemberStatus;
}

export interface FcTeamStaffRef {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
  role: FcMemberRole;
}

export interface FcTeam {
  id: string;
  club_id: string;
  name: string;
  category?: FcTeamCategory;
  level?: 'amateur' | 'regional' | 'national' | 'professional' | 'elite';
  season: string;
  gender?: 'male' | 'female' | 'mixed';
  manager_id?: FcTeamStaffRef | string | null;
  assistant_coaches?: Array<FcTeamStaffRef | string>;
  players: Array<FcTeamPlayerRef | string>;
  description?: string;
  logo_url?: string;
  home_stadium?: string;
  primary_color?: string;
  secondary_color?: string;
  league_name?: string;
  division?: string;
  matches_played?: number;
  matches_won?: number;
  matches_drawn?: number;
  matches_lost?: number;
  goals_for?: number;
  goals_against?: number;
  status: 'active' | 'inactive' | 'disbanded';
  /** Virtuels calculés par le backend. */
  playersCount?: number;
  points?: number;
  goalDifference?: number;
  winRate?: number;
  created_at: string;
  updated_at: string;
}

// ==========================================================================
// Matchs
// ==========================================================================

export type FcMatchStatus =
  | 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed' | 'cancelled';

export type FcMatchType = 'friendly' | 'league' | 'cup' | 'tournament' | 'training';

export interface FcMatchTeamRef {
  id: string;
  name: string;
  logo?: string;
  clubId?: string;
}

export interface FcMatch {
  /**
   * match-service ne sérialise pas les virtuels : ses documents sortent avec
   * `_id` et sans `id`, à la différence du reste de la plateforme. Les
   * adaptateurs acceptent donc les deux.
   */
  id?: string;
  _id: string;
  homeTeam: FcMatchTeamRef;
  awayTeam: FcMatchTeamRef;
  date: string;
  time: string;
  venue: { name: string; city?: string; address?: string; capacity?: number };
  status: FcMatchStatus;
  type: FcMatchType;
  competition?: { id: string; name: string; round?: string };
  score: { home: number; away: number; homeHalftime?: number; awayHalftime?: number };
  attendance?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================================================
// Boutique
// ==========================================================================

export interface FcProduct {
  /** marketplace-service sérialise les virtuels : `id` et `_id` cohabitent. */
  id?: string;
  _id: string;
  name: string;
  description: string;
  category: 'equipment' | 'clothing' | 'footwear' | 'accessories' | 'training' | 'other';
  subcategory?: string;
  price: number;
  currency: string;
  stock: number;
  images: string[];
  seller: { id: string; name: string; type: 'user' | 'club' | 'store' };
  specifications: { brand?: string; size?: string; color?: string; [key: string]: unknown };
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'used';
  rating: { average: number; count: number };
  tags: string[];
  featured: boolean;
  isActive: boolean;
  soldCount: number;
  createdAt: string;
}

// ==========================================================================
// Publications éditoriales (actualités du club)
// ==========================================================================

export type FcContentStatus = 'idea' | 'draft' | 'scheduled' | 'published' | 'archived';

export interface FcContentPost {
  id: string;
  club_id: string;
  title: string;
  body?: string;
  hashtags: string[];
  channels: string[];
  status: FcContentStatus;
  scheduled_for?: string;
  published_at?: string;
  published_urls: string[];
  asset_ids: string[];
  /** Peuplé par l'endpoint public à venir ; sinon, ids bruts. */
  assets?: Array<{ id: string; url?: string; title?: string }>;
  created_at: string;
  updated_at: string;
}

// ==========================================================================
// Comptes
// ==========================================================================

export type FcUserType = 'player' | 'coach' | 'club' | 'amateur' | 'admin' | 'shop_admin';

export interface FcUser {
  id: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  user_type: FcUserType;
  avatar_url?: string;
  is_verified: boolean;
}
