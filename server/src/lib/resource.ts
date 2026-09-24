/**
 * Fabrique de routes pour une ressource éditoriale.
 *
 * Articles, produits, légendes et étapes d'histoire se gèrent de la même
 * façon : le public lit ce qui est publié, l'administration lit tout et écrit.
 * Écrire quatre fois les mêmes cinq routes reviendrait à corriger quatre fois
 * le même oubli — la liste des ressources dit donc ce qui les distingue, et
 * rien de plus.
 */

import { Router } from 'express';
import { FilterQuery, Model } from 'mongoose';
import Joi from 'joi';
import { handler, notFound } from './http';
import { Permission } from './roles';
import { authenticate, canPreviewDrafts, optionalAuth, requirePermission } from '../middlewares/auth';

export interface ResourceOptions<T> {
  model: Model<T>;
  /**
   * Droit exigé pour écrire.
   *
   * La lecture reste ouverte ; c'est cette permission qui décide qui crée,
   * modifie et supprime. Une rubrique confiée aux journalistes et une autre à
   * la boutique ne diffèrent que par cette ligne.
   */
  permission: Permission;
  /** Champs acceptés à la création ; les autres sont écartés. */
  createSchema: Joi.ObjectSchema;
  /** Même chose à la mise à jour, tous les champs facultatifs. */
  updateSchema: Joi.ObjectSchema;
  /** Tri Mongo par défaut de la liste. */
  defaultSort: string;
  /**
   * Restriction appliquée aux visiteurs anonymes.
   *
   * C'est elle qui garde les brouillons hors de la vitrine. Un membre de
   * l'administration consulte les mêmes routes sans ce filtre : l'aperçu qu'il
   * voit est donc bien celui qu'il publiera.
   */
  publicFilter?: FilterQuery<T>;
  /** Champs balayés par le paramètre `search`. */
  searchable?: string[];
  /** Filtres d'égalité simples acceptés en query. */
  filters?: string[];
  /**
   * Appelé après chaque écriture réussie, avec l'élément avant et après
   * (`null` à la création pour l'un, à la suppression pour l'autre). Sert aux
   * ressources dont l'écriture a des conséquences ailleurs — une feuille de
   * match qui compte des buts aux joueurs.
   */
  afterWrite?: (before: T | null, after: T | null) => Promise<void>;
}

const MAX_LIMIT = 100;

export const buildResourceRouter = <T>(options: ResourceOptions<T>): Router => {
  const router = Router();
  const { model, permission, publicFilter, searchable = [], filters = [] } = options;
  const requireWrite = requirePermission(permission);

  const scopeFor = (staffPreview: boolean): FilterQuery<T> =>
    staffPreview || !publicFilter ? {} : publicFilter;

  router.get(
    '/',
    optionalAuth,
    handler(async (req, res) => {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(MAX_LIMIT, Math.max(1, Number(req.query.limit) || 50));

      const query: Record<string, unknown> = { ...scopeFor(canPreviewDrafts(req)) };

      for (const field of filters) {
        const value = req.query[field];
        if (typeof value === 'string' && value) query[field] = value;
      }

      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
      if (search && searchable.length > 0) {
        const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        query.$or = searchable.map((field) => ({ [field]: pattern }));
      }

      const [items, total] = await Promise.all([
        model
          .find(query as FilterQuery<T>)
          .sort((req.query.sort as string) || options.defaultSort)
          .skip((page - 1) * limit)
          .limit(limit),
        model.countDocuments(query as FilterQuery<T>),
      ]);

      res.json({
        success: true,
        data: items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    })
  );

  router.get(
    '/:id',
    optionalAuth,
    handler(async (req, res) => {
      const item = await model.findOne({
        _id: req.params.id,
        ...scopeFor(canPreviewDrafts(req)),
      } as FilterQuery<T>);

      if (!item) throw notFound();
      res.json({ success: true, data: item });
    })
  );

  router.post(
    '/',
    authenticate,
    requireWrite,
    handler(async (req, res) => {
      const value = await options.createSchema.validateAsync(req.body, { stripUnknown: true });
      const created = await model.create(value);
      await options.afterWrite?.(null, created.toObject() as T);
      res.status(201).json({ success: true, data: created });
    })
  );

  router.put(
    '/:id',
    authenticate,
    requireWrite,
    handler(async (req, res) => {
      const value = await options.updateSchema.validateAsync(req.body, { stripUnknown: true });

      // L'état d'avant n'est lu que si quelqu'un en a besoin.
      const before = options.afterWrite ? await model.findById(req.params.id).lean() : null;

      // `runValidators` : sans lui, une mise à jour contourne les contraintes du
      // schéma que la création respecte.
      const updated = await model.findByIdAndUpdate(req.params.id, value, {
        new: true,
        runValidators: true,
      });

      if (!updated) throw notFound();
      await options.afterWrite?.(before as T | null, updated.toObject() as T);
      res.json({ success: true, data: updated });
    })
  );

  router.delete(
    '/:id',
    authenticate,
    requireWrite,
    handler(async (req, res) => {
      const deleted = await model.findByIdAndDelete(req.params.id);
      if (!deleted) throw notFound();
      await options.afterWrite?.(deleted.toObject() as T, null);
      res.json({ success: true, message: 'Supprimé' });
    })
  );

  return router;
};
