/**
 * Saisie des réservations de billets.
 *
 * Le supporter ne fournit que ce qu'il faut pour être rappelé et pour tenir
 * sa place : le club décide du reste. Le statut, la note interne et la
 * référence ne sont donc pas dans le schéma public — un champ accepté du
 * client est un champ qu'il peut choisir, et personne ne réserve une place en
 * se déclarant « retirée au guichet ».
 */

import Joi from 'joi';
import { RESERVATION_STATUSES } from '../models/TicketReservation.model';

export const createReservationSchema = Joi.object({
  match: Joi.string().hex().length(24).required().messages({
    'any.required': 'Choisir la rencontre',
    'string.hex': 'Rencontre inconnue',
  }),
  name: Joi.string().trim().min(2).max(120).required().messages({
    'string.min': 'Indiquer un nom',
    'any.required': 'Nom requis',
  }),
  /**
   * Numéro sénégalais ou international, écrit comme on le dicte : espaces,
   * points et tirets admis. Exiger un format strict ferait échouer des saisies
   * parfaitement valables, alors que ce numéro sert à rappeler quelqu'un — pas
   * à composer automatiquement.
   */
  phone: Joi.string()
    .trim()
    .pattern(/^\+?[\d\s.-]{7,20}$/)
    .required()
    .messages({
      'string.pattern.base': 'Numéro de téléphone invalide',
      'any.required': 'Téléphone requis',
    }),
  email: Joi.string().email().max(255).allow('').default(''),
  seats: Joi.number().integer().min(1).max(20).required().messages({
    'number.max': 'Au-delà de 20 places, contacter le club directement',
    'any.required': 'Indiquer le nombre de places',
  }),
  message: Joi.string().allow('').max(1000).default(''),
});

/** Ce que le club modifie ensuite : l'avancement, et ce qu'il note pour lui. */
export const updateReservationSchema = Joi.object({
  status: Joi.string().valid(...RESERVATION_STATUSES),
  note: Joi.string().allow('').max(1000),
  seats: Joi.number().integer().min(1).max(20),
})
  .min(1)
  .messages({ 'object.min': 'Aucune modification fournie' });
