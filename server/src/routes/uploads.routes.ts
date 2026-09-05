/**
 * Téléversement des images de l'administration.
 *
 * Les fichiers sont posés sur le disque du serveur et servis en statique. Pas
 * de stockage objet : un site de club produit quelques dizaines d'images par
 * saison, et une sauvegarde du dossier suffit à les protéger.
 *
 * Ne sont acceptées que les images, et seuls les profils qui publient du
 * contenu téléversent : une route d'upload ouverte devient un hébergeur de
 * fichiers pour tout le monde.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Router } from 'express';
import multer from 'multer';
import config from '../config/env';
import { HttpError } from '../lib/http';
import { authenticate, requirePermission } from '../middlewares/auth';

const router = Router();

fs.mkdirSync(config.upload.dir, { recursive: true });

const ALLOWED = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/avif', '.avif'],
  ['image/gif', '.gif'],
]);

const storage = multer.diskStorage({
  destination: (_req, _file, done) => done(null, config.upload.dir),
  filename: (_req, file, done) => {
    // Nom tiré au sort : le nom d'origine peut contenir des séparateurs de
    // chemin, et deux visiteurs peuvent téléverser « maillot.jpg » le même jour.
    const extension = ALLOWED.get(file.mimetype) ?? path.extname(file.originalname).toLowerCase();
    done(null, `${crypto.randomBytes(16).toString('hex')}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxBytes, files: 1 },
  fileFilter: (_req, file, done) => {
    if (!ALLOWED.has(file.mimetype)) {
      done(new HttpError(400, 'Format non accepté : JPEG, PNG, WebP, AVIF ou GIF uniquement'));
      return;
    }
    done(null, true);
  },
});

router.post('/', authenticate, requirePermission('media:upload'), upload.single('file'), (req, res) => {
  if (!req.file) throw new HttpError(400, 'Aucun fichier reçu');

  res.status(201).json({
    success: true,
    data: {
      // Chemin relatif : l'API peut changer de domaine sans invalider les
      // images déjà référencées dans les articles.
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

export default router;
