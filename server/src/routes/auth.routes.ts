/**
 * Comptes du site : inscription supporter, connexion, session.
 *
 * L'inscription ne crée que des supporters. Les comptes de l'administration
 * s'ouvrent depuis `/api/users`, réservé au super administrateur, et le tout
 * premier depuis le serveur (`npm run create:superadmin`) : aucune route
 * publique ne doit permettre de s'attribuer un rôle.
 *
 * Chaque réponse porte les permissions du compte à côté de son rôle. Elles ne
 * protègent rien — le serveur revérifie à chaque écriture — mais évitent au
 * site de recopier la table des droits pour savoir quels écrans afficher.
 */

import { Router } from 'express';
import SiteUser from '../models/SiteUser.model';
import { issueTokens, verify } from '../lib/tokens';
import { permissionsOf } from '../lib/roles';
import { handler, unauthorized } from '../lib/http';
import { authenticate } from '../middlewares/auth';
import { loginSchema, refreshSchema, registerSchema } from '../validators/auth';

const router = Router();

router.post(
  '/register',
  handler(async (req, res) => {
    const value = await registerSchema.validateAsync(req.body, { stripUnknown: true });

    const existing = await SiteUser.findOne({ email: value.email.toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, message: 'Cet email est déjà utilisé' });
      return;
    }

    const user = await SiteUser.create({
      name: value.name,
      email: value.email.toLowerCase(),
      password_hash: value.password, // haché par le hook du modèle
      favorite_team: value.favorite || undefined,
      role: 'subscriber',
    });

    res.status(201).json({
      success: true,
      data: {
        user,
        permissions: permissionsOf(user.role),
        tokens: issueTokens({ userId: user.id, role: user.role }),
      },
    });
  })
);

router.post(
  '/login',
  handler(async (req, res) => {
    const value = await loginSchema.validateAsync(req.body, { stripUnknown: true });

    // `password_hash` est `select: false` sur le modèle : il faut le demander.
    const user = await SiteUser.findOne({ email: value.email.toLowerCase() }).select(
      '+password_hash'
    );

    // Un seul message pour « email inconnu » et « mot de passe faux » : dire
    // lequel des deux est en cause confirmerait qu'une adresse a un compte.
    if (!user || !(await user.validatePassword(value.password))) {
      throw unauthorized('Email ou mot de passe incorrect');
    }

    if (!user.is_active) throw unauthorized('Ce compte est désactivé');

    user.last_login_at = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        user,
        permissions: permissionsOf(user.role),
        tokens: issueTokens({ userId: user.id, role: user.role }),
      },
    });
  })
);

router.post(
  '/refresh',
  handler(async (req, res) => {
    const value = await refreshSchema.validateAsync(req.body, { stripUnknown: true });
    const payload = verify(value.refresh_token, 'refresh');

    // Le rôle est relu en base plutôt que repris du jeton : un compte rétrogradé
    // ou désactivé ne doit pas garder ses droits jusqu'à l'expiration.
    const user = await SiteUser.findById(payload.userId);
    if (!user || !user.is_active) throw unauthorized('Session invalide');

    res.json({
      success: true,
      data: {
        user,
        permissions: permissionsOf(user.role),
        tokens: issueTokens({ userId: user.id, role: user.role }),
      },
    });
  })
);

router.get(
  '/me',
  authenticate,
  handler(async (req, res) => {
    const user = await SiteUser.findById(req.auth!.userId);
    if (!user || !user.is_active) throw unauthorized('Session invalide');

    res.json({ success: true, data: { user, permissions: permissionsOf(user.role) } });
  })
);

/**
 * Déconnexion.
 *
 * Sans liste noire de jetons, le serveur n'a rien à révoquer : c'est le client
 * qui oublie ses jetons. La route existe pour que le site n'ait pas à connaître
 * cette nuance, et pour accueillir une révocation le jour où elle s'impose.
 */
router.post('/logout', (_req, res) => {
  res.json({ success: true, message: 'Déconnecté' });
});

export default router;
