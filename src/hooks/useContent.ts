import {
  ArticleRecord,
  HeroSlideRecord,
  LegendRecord,
  ListParams,
  ProductRecord,
  articles as articlesApi,
  heroSlides as heroSlidesApi,
  history as historyApi,
  legends as legendsApi,
  products as productsApi,
} from '../services/site/content.service';
import { articles as staticArticles } from '../data/articles';
import { products as staticProducts } from '../data/products';
import { legends as staticLegends } from '../data/legends';
import { heroSlides as staticHeroSlides } from '../data/heroSlides';
import { getHistoryEvents } from '../data/history';
import { Article, HeroSlide, HistoryEvent, Legend, Product } from '../types';
import { ApiResource, useApiResource } from './useApiResource';

/**
 * Contenu éditorial, pour les pages publiques.
 *
 * Chaque hook lit le backend du site et retombe sur les données de `src/data/`
 * si le serveur ne répond pas — le site reste consultable, avec un contenu daté
 * plutôt qu'une page vide. `source` dit laquelle des deux est affichée.
 *
 * Les pages manipulent des `Article`, `Product`, `Legend` : le backend rend
 * déjà ces formes, sans traduction. Les types `*Record` n'en sont que la
 * variante à identifiant chaîne, et restent utilisables partout.
 */

export const useArticles = (params: ListParams = {}): ApiResource<Article[]> =>
  useApiResource<Article[]>(
    (signal) => articlesApi.list(params, signal),
    staticArticles,
    { deps: [JSON.stringify(params)] }
  );

export const useProducts = (params: ListParams = {}): ApiResource<Product[]> =>
  useApiResource<Product[]>(
    (signal) => productsApi.list(params, signal),
    staticProducts,
    { deps: [JSON.stringify(params)] }
  );

export const useLegends = (params: ListParams = {}): ApiResource<Legend[]> =>
  useApiResource<Legend[]>(
    (signal) => legendsApi.list(params, signal),
    staticLegends,
    { deps: [JSON.stringify(params)] }
  );

/**
 * Diapositives du carrousel de tête.
 *
 * Le repli n'est pas seulement là pour la panne : tant que le club n'a saisi
 * aucune diapositive, la base répond une liste vide, et un accueil sans tête
 * serait pire qu'un accueil daté. Une liste vide retombe donc, elle aussi, sur
 * `src/data/heroSlides.ts`.
 */
export const useHeroSlides = (): ApiResource<HeroSlide[]> => {
  const resource = useApiResource<HeroSlideRecord[]>(
    (signal) => heroSlidesApi.list({ sort: 'rank created_at' }, signal),
    [],
    { deps: [] }
  );

  return {
    ...resource,
    data: resource.data.length > 0 ? resource.data : staticHeroSlides,
  };
};

export const useHistoryEvents = (): ApiResource<HistoryEvent[]> =>
  useApiResource<HistoryEvent[]>(
    (signal) => historyApi.list({ sort: 'year' }, signal),
    getHistoryEvents()
  );

/**
 * Une entrée précise, cherchée d'abord dans la liste déjà chargée.
 *
 * Les pages de détail sont presque toujours atteintes depuis une liste : la
 * garder évite un aller-retour, et laisse la page s'afficher immédiatement.
 * L'appel direct ne sert qu'aux arrivées par lien externe ou par rechargement.
 */
const findById = <T extends { id: unknown }>(items: T[], id: string | undefined): T | undefined =>
  id ? items.find((item) => String(item.id) === String(id)) : undefined;

export const useArticle = (id: string | undefined) => {
  const list = useArticles();
  const known = findById(list.data, id);

  const single = useApiResource<ArticleRecord | null>(
    (signal) => articlesApi.get(id!, signal),
    null,
    { enabled: Boolean(id) && !known && !list.loading, deps: [id, Boolean(known)] }
  );

  return {
    article: known ?? single.data ?? undefined,
    loading: list.loading || single.loading,
    reload: single.reload,
  };
};

export const useProductRecord = (id: string | undefined) => {
  const list = useProducts();
  const known = findById(list.data, id);

  const single = useApiResource<ProductRecord | null>(
    (signal) => productsApi.get(id!, signal),
    null,
    { enabled: Boolean(id) && !known && !list.loading, deps: [id, Boolean(known)] }
  );

  return { product: known ?? single.data ?? undefined, loading: list.loading || single.loading };
};

export const useLegend = (id: string | undefined) => {
  const list = useLegends();
  const known = findById(list.data, id);

  const single = useApiResource<LegendRecord | null>(
    (signal) => legendsApi.get(id!, signal),
    null,
    { enabled: Boolean(id) && !known && !list.loading, deps: [id, Boolean(known)] }
  );

  return { legend: known ?? single.data ?? undefined, loading: list.loading || single.loading };
};
