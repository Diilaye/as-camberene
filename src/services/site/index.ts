/**
 * Backend du site : contenu éditorial, boutique, comptes.
 *
 * Tout ce que l'administration du site modifie passe par ici. Indépendant de
 * fconnect : le contenu reste modifiable et la connexion reste possible même
 * si la plateforme est hors service.
 */

export * as contentService from './content.service';
export * as siteAuthService from './auth.service';
export { siteMediaUrl } from './media';
export type {
  ArticleRecord,
  ProductRecord,
  LegendRecord,
  HistoryEventRecord,
} from './content.service';
