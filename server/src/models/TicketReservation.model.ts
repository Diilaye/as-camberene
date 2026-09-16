/**
 * Réservation de places pour une rencontre.
 *
 * Le supporter annonce combien de places il veut et laisse de quoi le
 * rappeler ; il règle au stade. Rien n'est encaissé en ligne : le club n'a pas
 * de passerelle de paiement, et une réservation qui promettrait un paiement
 * qu'elle ne prend pas serait pire que pas de réservation du tout.
 *
 * C'est donc une intention ferme, pas une vente : `seats` dit ce que le
 * supporter demande, et le statut dit où en est le club avec lui.
 *
 * La référence est ce que le supporter présente au guichet. Elle est tirée au
 * sort plutôt qu'incrémentée : une suite continue dirait à chacun combien de
 * réservations le club a prises.
 */

import crypto from 'crypto';
import mongoose, { Document, Schema } from 'mongoose';

export const RESERVATION_STATUSES = ['nouvelle', 'confirmee', 'honoree', 'annulee'] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

/** Ce que chaque statut veut dire, pour l'administration et les messages. */
export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  nouvelle: 'À traiter',
  confirmee: 'Confirmée',
  honoree: 'Retirée au guichet',
  annulee: 'Annulée',
};

export const generateReservationReference = (): string => {
  // Ni O ni 0, ni I ni 1 : la référence est dictée au téléphone et recopiée
  // au guichet.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const suffix = Array.from(crypto.randomBytes(6))
    .map((byte) => alphabet[byte % alphabet.length])
    .join('');
  return `BIL-${suffix}`;
};

export interface ITicketReservation extends Document {
  _id: mongoose.Types.ObjectId;
  reference: string;
  match: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  seats: number;
  status: ReservationStatus;
  /** Mot du supporter à la réservation. */
  message: string;
  /** Note interne du club ; jamais rendue au supporter. */
  note: string;
}

const ticketReservationSchema = new Schema<ITicketReservation>(
  {
    reference: { type: String, required: true, unique: true, uppercase: true, trim: true },
    match: { type: Schema.Types.ObjectId, ref: 'Match', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    email: { type: String, lowercase: true, trim: true, maxlength: 255 },
    // Un plafond par réservation : au-delà, c'est un groupe, et le club veut
    // en parler plutôt que de le découvrir au guichet.
    seats: { type: Number, required: true, min: 1, max: 20, default: 1 },
    status: { type: String, enum: RESERVATION_STATUSES, default: 'nouvelle', index: true },
    message: { type: String, default: '', maxlength: 1000 },
    note: { type: String, default: '', maxlength: 1000 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    collection: 'ticket_reservations',
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        if (ret.match && typeof ret.match !== 'object') ret.match = String(ret.match);
        return ret;
      },
    },
  }
);

export default mongoose.model<ITicketReservation>('TicketReservation', ticketReservationSchema);
