/**
 * Erreurs et enveloppe de réponse.
 *
 * L'API répond toujours `{ success, ... }` : c'est la forme que le site
 * connaît déjà de fconnect, autant ne pas lui en imposer une seconde.
 */

import { NextFunction, Request, RequestHandler, Response } from 'express';

export class HttpError extends Error {
  readonly status: number;
  readonly details: string[];

  constructor(status: number, message: string, details: string[] = []) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}

export const notFound = (message = 'Ressource introuvable'): HttpError =>
  new HttpError(404, message);

export const unauthorized = (message = 'Non authentifié'): HttpError =>
  new HttpError(401, message);

export const forbidden = (message = 'Accès refusé'): HttpError => new HttpError(403, message);

/**
 * Enrobe un contrôleur asynchrone pour que ses rejets partent au gestionnaire
 * d'erreurs. Sans cela, une promesse rejetée laisse la requête sans réponse
 * jusqu'au timeout du client.
 */
export const handler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
