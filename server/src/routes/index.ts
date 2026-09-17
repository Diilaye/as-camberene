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
import Player from '../models/Player.model';
import HeroSlide from '../models/HeroSlide.model';
import Match from '../models/Match.model';
import Team from '../models/Team.model';
import GalleryItem from '../models/GalleryItem.model';
import { buildResourceRouter } from '../lib/resource';
import {
  articlePatchSchema,
  articleSchema,
  galleryItemPatchSchema,
  galleryItemSchema,
  heroSlidePatchSchema,
  heroSlideSchema,
  historyEventPatchSchema,
  historyEventSchema,
  matchPatchSchema,
  matchSchema,
  legendPatchSchema,
  legendSchema,
  playerPatchSchema,
  playerSchema,
  teamPatchSchema,
  teamSchema,
  productPatchSchema,
  productSchema,
} from '../validators/content';
import authRoutes from './auth.routes';
import userRoutes from './users.routes';
import orderRoutes from './orders.routes';
import commentRoutes from './comments.routes';
import uploadRoutes from './uploads.routes';
import ticketRoutes from './tickets.routes';
import shareRoutes from './share.routes';

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

router.use(
  '/teams',
  buildResourceRouter({
    model: Team,
    // Même droit que l'effectif : une équipe sans joueurs n'a pas d'objet, et
    // qui tient l'un tient l'autre. Une permission de plus n'aurait fait que
    // multiplier les cases à cocher sans rien séparer d'utile.
    permission: 'players:write',
    createSchema: teamSchema,
    updateSchema: teamPatchSchema,
    defaultSort: 'rank name',
    // Une équipe retirée de la vitrine reste visible de l'administration —
    // et son effectif lui reste rattaché.
    publicFilter: { isVisible: true },
    searchable: ['name', 'subtitle', 'coach'],
    filters: ['category', 'slug'],
  })
);

router.use(
  '/players',
  buildResourceRouter({
    model: Player,
    permission: 'players:write',
    createSchema: playerSchema,
    updateSchema: playerPatchSchema,
    // Les gardiens d'abord, puis la défense, le milieu, l'attaque : `line` est
    // une chaîne, donc l'ordre alphabétique ne donnerait pas celui du terrain.
    // Le tri final se fait à l'affichage ; ici on groupe par équipe et numéro.
    defaultSort: 'team rank number name',
    // Une fiche retirée de la vitrine reste visible de l'administration.
    publicFilter: { isVisible: true },
    searchable: ['name', 'position', 'role'],
    filters: ['team', 'line', 'kind', 'status'],
  })
);

router.use(
  '/hero',
  buildResourceRouter({
    model: HeroSlide,
    permission: 'hero:write',
    createSchema: heroSlideSchema,
    updateSchema: heroSlidePatchSchema,
    // `rank` porte l'ordre voulu par le club ; la date de création départage
    // deux diapositives laissées au même rang, pour que l'ordre reste stable
    // d'un chargement à l'autre.
    defaultSort: 'rank created_at',
    // Une diapositive retirée de la vitrine reste modifiable dans l'administration.
    publicFilter: { isVisible: true },
    searchable: ['title', 'kicker'],
  })
);

router.use(
  '/matches',
  buildResourceRouter({
    model: Match,
    permission: 'matches:write',
    createSchema: matchSchema,
    updateSchema: matchPatchSchema,
    // `date` est au format AAAA-MM-JJ : l'ordre alphabétique est l'ordre
    // chronologique, et la saison se lit du premier au dernier match.
    defaultSort: 'date time',
    // Tout le calendrier est public : une rencontre n'a pas de brouillon.
    searchable: ['opponent', 'competition'],
    filters: ['status', 'venue', 'competition'],
  })
);

router.use(
  '/gallery',
  buildResourceRouter({
    model: GalleryItem,
    permission: 'gallery:write',
    createSchema: galleryItemSchema,
    updateSchema: galleryItemPatchSchema,
    // Les photos épinglées d'abord, puis la plus récente : un album se lit à
    // l'envers de son remplissage.
    defaultSort: '-rank -date -created_at',
    publicFilter: { isVisible: true },
    searchable: ['title', 'description'],
    filters: ['category', 'match'],
  })
);

// Commandes : création ouverte au public, suivi réservé à la boutique.
router.use('/orders', orderRoutes);

// Billetterie : réservation ouverte au public, suivi réservé au club.
router.use('/tickets', ticketRoutes);

// Aperçus de partage : lus par les robots des réseaux, jamais par le site.
router.use('/share', shareRoutes);

router.use('/uploads', uploadRoutes);

export default router;
