/**
 * Élection du joueur du mois.
 *
 * Le club nomme quelques joueurs de l'effectif pour un mois donné ; les
 * supporters connectés votent, une fois chacun. Un seul vote est ouvert à la
 * fois : ouvrir celui d'un mois ferme le précédent.
 *
 * Les votes vivent dans leur propre collection (`PlayerOfMonthVote`), avec un
 * index unique par élection et par compte : c'est la base elle-même qui
 * garantit « un vote par personne », même si deux requêtes arrivent ensemble.
 */

import mongoose, { Document, Schema } from 'mongoose';

export const POTM_STATUSES = ['open', 'closed'] as const;
export type PotmStatus = (typeof POTM_STATUSES)[number];

export interface IPlayerOfMonth extends Document {
  _id: mongoose.Types.ObjectId;
  /** Mois concerné, `AAAA-MM`. */
  month: string;
  title: string;
  nominees: mongoose.Types.ObjectId[];
  status: PotmStatus;
}

const playerOfMonthSchema = new Schema<IPlayerOfMonth>(
  {
    month: { type: String, required: true, unique: true, match: /^\d{4}-\d{2}$/ },
    title: { type: String, trim: true, maxlength: 150, default: '' },
    nominees: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    status: { type: String, enum: POTM_STATUSES, default: 'open', index: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    collection: 'player_of_month',
  }
);

export default mongoose.model<IPlayerOfMonth>('PlayerOfMonth', playerOfMonthSchema);

export interface IPlayerOfMonthVote extends Document {
  poll: mongoose.Types.ObjectId;
  player: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
}

const voteSchema = new Schema<IPlayerOfMonthVote>(
  {
    poll: { type: Schema.Types.ObjectId, ref: 'PlayerOfMonth', required: true },
    player: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'SiteUser', required: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    versionKey: false,
    collection: 'player_of_month_votes',
  }
);

// Un vote par compte et par élection : la règle est tenue par la base.
voteSchema.index({ poll: 1, user: 1 }, { unique: true });
voteSchema.index({ poll: 1, player: 1 });

export const PlayerOfMonthVote = mongoose.model<IPlayerOfMonthVote>('PlayerOfMonthVote', voteSchema);
