/**
 * Schémas de saisie de l'administration.
 *
 * Un schéma de création par ressource, et sa variante « tous les champs
 * facultatifs » pour la mise à jour partielle, dérivée du premier plutôt que
 * recopiée : les deux ne peuvent pas diverger.
 */

import Joi from 'joi';
import { ARTICLE_CATEGORIES } from '../models/Article.model';
import { PRODUCT_CATEGORIES, PRODUCT_TYPES } from '../models/Product.model';
import { LEGEND_ERAS } from '../models/Legend.model';

/**
 * Même schéma, tout devenant facultatif, et au moins un champ exigé.
 *
 * `noDefaults` est indispensable : rendre un champ facultatif ne lui retire pas
 * sa valeur par défaut, et Joi la réapplique pour toute clé absente. Sans cette
 * préférence, `{ inStock: false }` était validé en un objet complet — image
 * vide, description vide, tailles vides — que la mise à jour écrivait ensuite
 * par-dessus le produit. Une modification d'un champ effaçait tous les autres.
 */
const asPatch = (schema: Joi.ObjectSchema): Joi.ObjectSchema =>
  schema
    .fork(Object.keys(schema.describe().keys), (field) => field.optional())
    .min(1)
    .prefs({ noDefaults: true });

export const articleSchema = Joi.object({
  title: Joi.string().trim().max(250).required(),
  content: Joi.string().allow('').max(50000).default(''),
  excerpt: Joi.string().allow('').max(1000).default(''),
  image: Joi.string().allow('').max(500).default(''),
  category: Joi.string().valid(...ARTICLE_CATEGORIES).default('Club'),
  publishedAt: Joi.date().default(() => new Date()),
  author: Joi.string().trim().max(120).default('ASC Cambérène'),
  status: Joi.string().valid('draft', 'published').default('draft'),
});

export const productSchema = Joi.object({
  name: Joi.string().trim().max(200).required(),
  price: Joi.number().min(0).required(),
  category: Joi.string().valid(...PRODUCT_CATEGORIES).default('Accessoires'),
  type: Joi.string().valid(...PRODUCT_TYPES).default('Autre'),
  image: Joi.string().allow('').max(500).default(''),
  images: Joi.array().items(Joi.string().max(500)).default([]),
  description: Joi.string().allow('').max(5000).default(''),
  sizes: Joi.array().items(Joi.string().max(20)).default([]),
  inStock: Joi.boolean().default(true),
  isVisible: Joi.boolean().default(true),
});

export const legendSchema = Joi.object({
  name: Joi.string().trim().max(150).required(),
  position: Joi.string().allow('').max(100).default(''),
  period: Joi.string().allow('').max(50).default(''),
  nationality: Joi.string().allow('').max(100).default(''),
  photo: Joi.string().allow('').max(500).default(''),
  achievements: Joi.array().items(Joi.string().max(300)).default([]),
  stats: Joi.object({
    matches: Joi.number().min(0).default(0),
    goals: Joi.number().min(0).default(0),
    assists: Joi.number().min(0).default(0),
    trophies: Joi.number().min(0).default(0),
  }).default({ matches: 0, goals: 0, assists: 0, trophies: 0 }),
  biography: Joi.string().allow('').max(10000).default(''),
  quote: Joi.string().allow('').max(500).default(''),
  jerseyNumber: Joi.number().min(0).max(99).default(0),
  era: Joi.string().valid(...LEGEND_ERAS).default('Modern Era'),
  isHallOfFame: Joi.boolean().default(false),
  rank: Joi.number().default(0),
});

export const historyEventSchema = Joi.object({
  year: Joi.number().integer().min(1800).max(new Date().getFullYear() + 5).required(),
  dateLabel: Joi.string().allow('').max(60),
  title: Joi.string().trim().max(250).required(),
  description: Joi.string().allow('').max(5000).default(''),
  tags: Joi.array().items(Joi.string().max(60)).default([]),
  image: Joi.string().allow('').max(500),
  phase: Joi.string().allow('').max(80),
});

export const commentSchema = Joi.object({
  author: Joi.string().trim().min(2).max(80).required(),
  content: Joi.string().trim().min(2).max(2000).required(),
});

export const articlePatchSchema = asPatch(articleSchema);
export const productPatchSchema = asPatch(productSchema);
export const legendPatchSchema = asPatch(legendSchema);
export const historyEventPatchSchema = asPatch(historyEventSchema);
