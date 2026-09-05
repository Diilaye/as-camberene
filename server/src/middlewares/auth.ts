/**
 * Reconnaissance du porteur d'une requête, et contrôle de ses droits.
 *
 * Quatre portes : `optionalAuth` regarde sans exiger — c'est elle qui permet à
 * un membre de l'administration de voir ses brouillons sur les mêmes routes que
 * le public ; `authenticate` exige un compte ; `requirePermission` exige un
 * droit précis ; `requireStaff` exige seulement l'accès à l'administration.
 *
 * `authenticate` relit le compte en base à chaque requête, et n'accepte pas le
 * rôle inscrit dans le jeton. C'est ce qui rend la désactivation immédiate :
 * sans cette lecture, un compte fermé continuerait d'écrire jusqu'à
 * l'expiration de son jeton d'accès — deux heures pendant lesquelles le super
 * administrateur croirait l'accès coupé. Une lecture indexée par requête
 * authentifiée est un prix négligeable pour une administration de club.
 *
 * `optionalAuth` s'en dispense : elle ne sert qu'à montrer les brouillons sur
 * des routes publiques, et ne débloque aucune écriture.
 */

import { NextFunction, Request, Response } from 'express';
import SiteUser from '../models/SiteUser.model';
import { TokenPayload, verify } from '../lib/tokens';
import { Permission, ROLE_LABELS, isStaffRole, roleCan } from '../lib/roles';
import { forbidden, unauthorized } from '../lib/http';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}

const bearerToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  return header?.startsWith('Bearer ') ? header.slice(7) : null;
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = bearerToken(req);
  if (!token) return next();

  try {
    req.auth = verify(token, 'access');
  } catch {
    // Jeton absent, expiré ou douteux : la requête continue en anonyme. Les
    // routes qui exigent un compte le refuseront elles-mêmes.
  }
  next();
};

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const token = bearerToken(req);
  if (!token) return next(unauthorized());

  let payload: TokenPayload;
  try {
    payload = verify(token, 'access');
  } catch (error) {
    return next(error);
  }

  // Le rôle vient de la base, pas du jeton : une rétrogradation ou une
  // désactivation prend effet à la requête suivante, sans attendre l'expiration.
  SiteUser.findById(payload.userId)
    .select('role is_active')
    .then((account) => {
      if (!account || !account.is_active) return next(unauthorized('Session invalide'));
      req.auth = { userId: payload.userId, role: account.role };
      next();
    })
    .catch(next);
};

/**
 * Exige une permission précise.
 *
 * Le message nomme le rôle du demandeur : sur une administration à plusieurs
 * profils, « Accès refusé » laisserait croire à une panne alors que le compte
 * est simplement sur la mauvaise rubrique.
 */
export const requirePermission =
  (permission: Permission) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) return next(unauthorized());
    if (!roleCan(req.auth.role, permission)) {
      return next(
        forbidden(`Votre profil (${ROLE_LABELS[req.auth.role]}) n'a pas accès à cette rubrique`)
      );
    }
    next();
  };

/** Exige un compte de l'administration, quel que soit son profil. */
export const requireStaff = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.auth) return next(unauthorized());
  if (!isStaffRole(req.auth.role)) return next(forbidden("Réservé à l'administration du site"));
  next();
};

/**
 * Le demandeur voit-il le contenu non publié ?
 *
 * Tout membre de l'administration y a droit, y compris sur les rubriques qu'il
 * ne peut pas modifier : relire un brouillon n'est pas l'écrire.
 */
export const canPreviewDrafts = (req: Request): boolean =>
  Boolean(req.auth && isStaffRole(req.auth.role));
