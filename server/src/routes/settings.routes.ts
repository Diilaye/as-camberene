/**
 * Contenu du site : lecture publique, écriture par l'administration.
 *
 * Un seul document, remplacé en entier à chaque enregistrement : l'écran
 * d'administration envoie toujours l'ensemble, ce qui évite qu'une moitié de
 * formulaire en écrase une autre.
 */

import { Router } from 'express';
import SiteSettings from '../models/SiteSettings.model';
import { handler } from '../lib/http';
import { authenticate, requirePermission } from '../middlewares/auth';
import { siteSettingsSchema } from '../validators/settings';

const router = Router();

// `null` tant que rien n'a été enregistré : le site garde alors ses valeurs
// d'origine, sans qu'il faille les recopier ici.
router.get(
  '/',
  handler(async (_req, res) => {
    const settings = await SiteSettings.findOne({ key: 'site' }).lean();
    res.json({ success: true, data: settings?.content ?? null });
  })
);

router.put(
  '/',
  authenticate,
  requirePermission('settings:write'),
  handler(async (req, res) => {
    const content = await siteSettingsSchema.validateAsync(req.body, { stripUnknown: true });
    const settings = await SiteSettings.findOneAndUpdate(
      { key: 'site' },
      { content },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    res.json({ success: true, data: settings?.content ?? content });
  })
);

export default router;
