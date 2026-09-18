/**
 * Rencontre du calendrier.
 *
 * Le calendrier et les résultats de l'équipe première. Ils vivaient dans
 * `src/data/matches.ts`, figés à la saison 2025 : changer une date demandait un
 * développeur et un déploiement, et le site annonçait des rencontres passées.
 * Le club les tient désormais lui-même.
 *
 * `date` et `time` restent deux chaînes plutôt qu'un instant unique. C'est ce
 * que le club saisit — « le 20 juillet à 17h » — et une date-heure stockée en
 * UTC se relirait décalée le jour où le site servirait un autre fuseau, pour
 * une précision dont un calendrier de matchs n'a pas l'usage. Au format
 * `AAAA-MM-JJ`, l'ordre alphabétique est aussi l'ordre chronologique : le tri
 * de la liste marche sans conversion.
 */

import mongoose, { Document, Schema } from 'mongoose';

/** Le club reçoit, ou se déplace. */
export const MATCH_VENUES = ['Domicile', 'Extérieur'] as const;
export type MatchVenue = (typeof MATCH_VENUES)[number];

export const MATCH_STATUSES = ['À venir', 'En cours', 'Terminé'] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

/** Camp du buteur : l'équipe du club, ou celle d'en face. */
export const SCORER_SIDES = ['club', 'opponent'] as const;
export type ScorerSide = (typeof SCORER_SIDES)[number];

/**
 * Un but de la rencontre.
 *
 * `name` est toujours renseigné, `player` seulement quand le buteur est une
 * fiche de l'effectif. Le nom est donc recopié plutôt que lu à travers la
 * référence : un buteur adverse n'a pas de fiche, et un joueur retiré de
 * l'effectif ne doit pas effacer le but qu'il a marqué.
 */
export interface IMatchScorer {
  player: mongoose.Types.ObjectId | null;
  name: string;
  /** Minute du but ; 0 quand le club ne l'a pas notée. */
  minute: number;
  side: ScorerSide;
}

export interface IMatch extends Document {
  _id: mongoose.Types.ObjectId;
  opponent: string;
  /** Jour de la rencontre, `AAAA-MM-JJ`. */
  date: string;
  /** Heure du coup d'envoi, `HH:MM`. */
  time: string;
  venue: MatchVenue;
  competition: string;
  /**
   * Score, une fois la rencontre jouée.
   *
   * `home` et `away` suivent l'affiche, pas le club : à l'extérieur, le score
   * de Cambérène est `away`. C'est la convention que la page d'accueil et les
   * données d'origine emploient déjà.
   */
  result?: { home: number; away: number };
  status: MatchStatus;
  /**
   * Buteurs de la rencontre, les deux camps confondus.
   *
   * À côté du score et non à sa place : le club saisit d'abord un résultat, et
   * complète la feuille de match quand il l'a. Rien n'impose que les buts
   * saisis totalisent le score — une liste incomplète reste plus utile
   * qu'absente, et l'administration signale l'écart sans le refuser.
   */
  scorers: IMatchScorer[];
  /**
   * Affiche de la rencontre, ou photo d'après-match.
   *
   * Facultative : sans elle, les cartes du site gardent leur mise en page
   * compacte, qui reste la plus lisible pour une liste de rencontres.
   */
  image: string;
}

/*
  `_id: false` : un but n'a pas d'existence propre, il n'est jamais adressé ni
  modifié seul. La liste se réenregistre entière à chaque édition.
*/
const scorerSchema = new Schema<IMatchScorer>(
  {
    player: { type: Schema.Types.ObjectId, ref: 'Player', default: null },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    minute: { type: Number, default: 0, min: 0, max: 130 },
    side: { type: String, enum: SCORER_SIDES, default: 'club' },
  },
  { _id: false }
);

const matchSchema = new Schema<IMatch>(
  {
    opponent: { type: String, required: true, trim: true, maxlength: 150 },
    date: {
      type: String,
      required: true,
      trim: true,
      // Le format est ce qui rend le tri chronologique : une saisie libre le
      // casserait sans que rien ne le signale.
      match: [/^\d{4}-\d{2}-\d{2}$/, 'La date doit être au format AAAA-MM-JJ'],
      index: true,
    },
    time: {
      type: String,
      trim: true,
      default: '16:00',
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "L'heure doit être au format HH:MM"],
    },
    venue: { type: String, enum: MATCH_VENUES, default: 'Domicile' },
    competition: { type: String, trim: true, maxlength: 120, default: 'Ligue 1 Sénégal' },
    result: {
      type: {
        home: { type: Number, min: 0, max: 99, required: true },
        away: { type: Number, min: 0, max: 99, required: true },
      },
      // `default: undefined` : sans lui, Mongoose crée un sous-document vide
      // pour chaque match à venir, et le site croirait tous les scores à 0-0.
      default: undefined,
      _id: false,
    },
    status: { type: String, enum: MATCH_STATUSES, default: 'À venir', index: true },
    scorers: {
      type: [scorerSchema],
      default: [],
      // Une feuille de match ne dépasse pas cette longueur ; la borne est là
      // contre une saisie qui part en boucle, pas contre un match prolifique.
      validate: [(value: IMatchScorer[]) => value.length <= 30, 'Trop de buteurs saisis'],
    },
    image: { type: String, maxlength: 500, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    collection: 'matches',
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  }
);

export default mongoose.model<IMatch>('Match', matchSchema);
