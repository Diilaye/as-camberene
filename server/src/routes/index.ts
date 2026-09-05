/**
 * Carte de l'API.
 *
 * Les quatre ressources éditoriales passent par la même fabrique : ce fichier
 * dit ce qui les distingue — quel droit il faut pour y écrire, ce que le public
 * en voit, sur quoi on cherche, sur quoi on filtre — et rien d'autre.
 */

import { Router } from 'express';
import Article from '../models/Article.model';
import Product from '../models/Product.model';
import Legend from '../models/Legend.model';
import HistoryEvent from '../models/HistoryEvent.model';
import { buildResourceRouter } from '../lib/resource';
import {
  articlePatchSchema,
  articleSchema,
  historyEventPatchSchema,
  historyEventSchema,
  legendPatchSchema,
  legendSchema,
  productPatchSchema,
  productSchema,
} from '../validators/content';
import authRoutes from './auth.routes';
import userRoutes from './users.routes';
import orderRoutes from './orders.routes';
import commentRoutes from './comments.routes';
import uploadRoutes from './uploads.routes';

const router = Router();

router.use('/auth', authRoutes);

// Comptes de l'administration : réservé au super administrateur.
router.use('/users', userRoutes);

router.use(
  '/articles',
  buildResourceRouter({
    model: Article,
    permission: 'articles:write',
    createSchema: articleSchema,
    updateSchema: articlePatchSchema,
    defaultSort: '-publishedAt',
    // Un brouillon ne sort pas : c'est toute la différence entre écrire et publier.
    publicFilter: { status: 'published' },
    searchable: ['title', 'excerpt', 'content'],
    filters: ['category', 'status'],
  })
);

// Monté à part : les commentaires vivent sous un article, pas à côté.
router.use('/articles/:articleId/comments', commentRoutes);

router.use(
  '/products',
  buildResourceRouter({
    model: Product,
    permission: 'products:write',
    createSchema: productSchema,
    updateSchema: productPatchSchema,
    defaultSort: '-created_at',
    publicFilter: { isVisible: true },
    searchable: ['name', 'description'],
    filters: ['category', 'type'],
  })
);

router.use(
  '/legends',
  buildResourceRouter({
    model: Legend,
    permission: 'legends:write',
    createSchema: legendSchema,
    updateSchema: legendPatchSchema,
    defaultSort: 'rank name',
    searchable: ['name', 'position', 'biography'],
    filters: ['era'],
  })
);

router.use(
  '/history',
  buildResourceRouter({
    model: HistoryEvent,
    permission: 'history:write',
    createSchema: historyEventSchema,
    updateSchema: historyEventPatchSchema,
    defaultSort: 'year',
    searchable: ['title', 'description'],
    filters: ['phase'],
  })
);

// Commandes : création ouverte au public, suivi réservé à la boutique.
router.use('/orders', orderRoutes);

router.use('/uploads', uploadRoutes);

export default router;
