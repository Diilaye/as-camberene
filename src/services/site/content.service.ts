/**
 * Contenu du site : actualités, boutique, légendes, histoire, effectif.
 *
 * Ces cinq ressources partagent la même API — c'est la fabrique de routes du
 * backend (`server/src/lib/resource.ts`) qui le garantit. Elles partagent donc
 * ici le même client, et chaque ressource ne déclare que son chemin et son type.
 *
 * Les documents rendus par le backend ont déjà la forme attendue par le site :
 * aucun adaptateur, contrairement aux données venues de fconnect. Seules les
 * images passent par `siteMediaUrl`, et les dates par une normalisation.
 */

import { siteApi } from '../../lib/api';
import {
  Article,
  Comment,
  HeroSlide,
  HistoryEvent,
  Legend,
  Match,
  Product,
  Team,
  TeamMember,
} from '../../types';
import { siteMediaUrl } from './media';

/**
 * Types du site, avec l'identifiant resserré sur la chaîne.
 *
 * `EntityId` accepte encore le nombre pour les données statiques de repli ; ce
 * qui vient du backend porte toujours un ObjectId. Le distinguer évite un
 * `String(id)` à chaque appel de service.
 */
export type ArticleRecord = Article & { id: string };
export type ProductRecord = Product & { id: string };
export type LegendRecord = Legend & { id: string };
export type HistoryEventRecord = HistoryEvent & { id: string };
export type HeroSlideRecord = HeroSlide & { id: string };
export type MatchRecord = Match & { id: string };
export type TeamRecord = Team & { id: string };
export type TeamMemberRecord = TeamMember;

export interface ListResponse<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ItemResponse<T> {
  success: boolean;
  data: T;
}

export interface ListParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  /** Filtres d'égalité propres à la ressource (category, era, phase…). */
  [key: string]: string | number | boolean | undefined;
}

/**
 * Accès à une ressource éditoriale.
 *
 * La lecture est anonyme — le backend ne rend alors que le contenu publié. Les
 * écritures joignent le jeton : elles ne passent que pour un administrateur, et
 * c'est le serveur qui le vérifie, jamais le formulaire.
 */
const resource = <T extends { id: string }>(path: string, normalize: (row: T) => T) => ({
  list: async (params: ListParams = {}, signal?: AbortSignal): Promise<T[]> => {
    const response = await siteApi.get<ListResponse<T>>(path, {
      query: params,
      // Un administrateur connecté voit aussi ses brouillons : le jeton est
      // joint quand il existe, et ignoré sinon.
      auth: true,
      signal,
    });
    return response.data.map(normalize);
  },

  get: async (id: string, signal?: AbortSignal): Promise<T> => {
    const response = await siteApi.get<ItemResponse<T>>(`${path}/${id}`, { auth: true, signal });
    return normalize(response.data);
  },

  create: async (payload: Partial<T>): Promise<T> => {
    const response = await siteApi.post<ItemResponse<T>>(path, payload, { auth: true });
    return normalize(response.data);
  },

  update: async (id: string, payload: Partial<T>): Promise<T> => {
    const response = await siteApi.put<ItemResponse<T>>(`${path}/${id}`, payload, { auth: true });
    return normalize(response.data);
  },

  remove: async (id: string): Promise<void> => {
    await siteApi.del(`${path}/${id}`, { auth: true });
  },
});

// ==========================================================================
// Normalisations
// ==========================================================================

const normalizeComment = (comment: Comment): Comment => ({
  ...comment,
  timestamp: String(comment.timestamp),
});

const normalizeArticle = (article: ArticleRecord): ArticleRecord => ({
  ...article,
  image: siteMediaUrl(article.image, 'assets/img/coupe.jpg'),
  // Le backend rend une date ISO complète ; les pages n'affichent que le jour.
  publishedAt: String(article.publishedAt),
  comments: (article.comments ?? []).map(normalizeComment),
});

const normalizeProduct = (product: ProductRecord): ProductRecord => {
  const images = (product.images ?? []).map((image) => siteMediaUrl(image)).filter(Boolean);
  return {
    ...product,
    image: siteMediaUrl(product.image) || images[0] || 'assets/img/vue-du-t-shirt-du-joueur-de-football.jpg',
    images: images.length > 0 ? images : [siteMediaUrl(product.image)].filter(Boolean),
  };
};

const normalizeLegend = (legend: LegendRecord): LegendRecord => ({
  ...legend,
  photo: siteMediaUrl(legend.photo, 'assets/img/vue-du-ballon-de-football.jpg'),
});

const normalizeTeamMember = (member: TeamMemberRecord): TeamMemberRecord => ({
  ...member,
  // Pas de fichier de repli ici : une fiche sans portrait garde une photo vide,
  // et c'est `IMAGE_PLACEHOLDER` qui tient la place à l'affichage. Désigner un
  // fichier absent donnerait l'icône d'image brisée du navigateur.
  photo: siteMediaUrl(member.photo),
});

/**
 * La photo passe par `siteMediaUrl`, pas le lien YouTube.
 *
 * L'un désigne un fichier téléversé sur l'API du site, l'autre une adresse de
 * YouTube : les faire passer par la même fonction préfixerait le second du
 * domaine de l'API.
 */
const normalizeHeroSlide = (slide: HeroSlideRecord): HeroSlideRecord => ({
  ...slide,
  image: slide.image ? siteMediaUrl(slide.image) : undefined,
});

/**
 * Rien à traduire : le calendrier ne porte ni image ni date à reformater.
 *
 * La fonction existe quand même parce que la fabrique en attend une, et pour
 * qu'un champ à normaliser un jour trouve sa place sans toucher au reste.
 */
const normalizeTeam = (team: TeamRecord): TeamRecord => ({
  ...team,
  image: siteMediaUrl(team.image),
});

const normalizeMatch = (match: MatchRecord): MatchRecord => match;

const normalizeHistoryEvent = (event: HistoryEventRecord): HistoryEventRecord => ({
  ...event,
  image: event.image ? siteMediaUrl(event.image) : undefined,
});

// ==========================================================================
// Ressources
// ==========================================================================

export const articles = resource<ArticleRecord>('/articles', normalizeArticle);
export const products = resource<ProductRecord>('/products', normalizeProduct);
export const legends = resource<LegendRecord>('/legends', normalizeLegend);
export const history = resource<HistoryEventRecord>('/history', normalizeHistoryEvent);
export const teamMembers = resource<TeamMemberRecord>('/players', normalizeTeamMember);
export const heroSlides = resource<HeroSlideRecord>('/hero', normalizeHeroSlide);
export const matches = resource<MatchRecord>('/matches', normalizeMatch);
export const teams = resource<TeamRecord>('/teams', normalizeTeam);

// ==========================================================================
// Commentaires — sous-ressource d'un article
// ==========================================================================

export const postComment = async (
  articleId: string,
  payload: { author: string; content: string }
): Promise<Comment> => {
  const response = await siteApi.post<ItemResponse<Comment>>(
    `/articles/${articleId}/comments`,
    payload
  );
  return normalizeComment(response.data);
};

export const deleteComment = async (articleId: string, commentId: string): Promise<void> => {
  await siteApi.del(`/articles/${articleId}/comments/${commentId}`, { auth: true });
};

// ==========================================================================
// Téléversement d'images
// ==========================================================================

export const uploadImage = async (file: File): Promise<string> => {
  const response = await siteApi.upload<ItemResponse<{ url: string }>>('/uploads', file);
  return response.data.url;
};
