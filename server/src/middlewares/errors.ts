import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Joi from 'joi';
import { HttpError } from '../lib/http';
import config from '../config/env';

export const routeNotFound = (req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: `Route inconnue : ${req.method} ${req.path}` });
};

/**
 * Traduction des pannes en réponses.
 *
 * Le message rendu au client est toujours choisi ici, jamais celui d'une
 * exception brute : une erreur Mongo recopiée telle quelle raconte la structure
 * de la base à qui la provoque.
 */
export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  // Express reconnaît un gestionnaire d'erreurs à ses quatre paramètres :
  // retirer `next` le transformerait en middleware ordinaire.
  _next: NextFunction
): void => {
  if (error instanceof HttpError) {
    res.status(error.status).json({
      success: false,
      message: error.message,
      ...(error.details.length > 0 ? { errors: error.details } : {}),
    });
    return;
  }

  // Saisie refusée par un schéma : c'est une erreur du client, et ses messages
  // sont écrits pour être montrés tels quels dans le formulaire.
  if (Joi.isError(error)) {
    res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: error.details.map((detail) => detail.message),
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: Object.values(error.errors).map((detail) => detail.message),
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ success: false, message: 'Identifiant invalide' });
    return;
  }

  // Violation d'index unique : c'est une erreur de saisie, pas une panne.
  if (typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000) {
    res.status(409).json({ success: false, message: 'Cette valeur est déjà utilisée' });
    return;
  }

  console.error('Erreur non gérée :', error);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    ...(config.isProduction ? {} : { detail: error instanceof Error ? error.message : String(error) }),
  });
};
