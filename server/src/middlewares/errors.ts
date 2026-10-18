import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Joi from 'joi';
import multer from 'multer';
import { HttpError } from '../lib/http';
import config from '../config/env';

export const routeNotFound = (req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: `Route inconnue : ${req.method} ${req.path}` });
};


export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  void _next;
  if (error instanceof HttpError) {
    res.status(error.status).json({
      success: false,
      message: error.message,
      ...(error.details.length > 0 ? { errors: error.details } : {}),
    });
    return;
  }

 
 
  // Fichier refusé par multer (trop lourd, trop de fichiers…) : faute du client.
  if (error instanceof multer.MulterError) {
    const maxMb = Math.round(config.upload.maxBytes / (1024 * 1024));
    res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
      success: false,
      message:
        error.code === 'LIMIT_FILE_SIZE'
          ? `Fichier trop lourd : ${maxMb} Mo maximum`
          : 'Envoi de fichier invalide',
    });
    return;
  }

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
