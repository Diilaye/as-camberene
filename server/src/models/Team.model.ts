/**
 * Équipe du club.
 *
 * Équipe première et catégories de jeunes : ce que la page `/teams` présente,
 * et ce à quoi chaque fiche de l'effectif est rattachée. Les cinq équipes
 * étaient jusqu'ici une liste figée dans le code — en ajouter une, une U13 par
 * exemple, demandait un développeur et un déploiement.
 *
 * `slug` est l'identité durable de l'équipe : il compose son adresse
 * (`/teams/equipe-u19`) et c'est lui que porte chaque joueur. Le renommer
 * détacherait tout l'effectif d'un coup et casserait les liens déjà partagés,
 * d'où sa fixité une fois l'équipe créée — le nom affiché, lui, se change
 * librement.
 *
 * L'effectif n'est pas ici : il vit dans `Player`, qui pointe l'équipe par son
 * slug. Un compteur de joueurs recopié sur l'équipe se démentirait au premier
 * transfert ; les pages comptent l'effectif réel.
 */

import mongoose, { Document, Schema } from 'mongoose';

export const TEAM_CATEGORIES = ['senior', 'youth'] as const;
export type TeamCategory = (typeof TEAM_CATEGORIES)[number];

export interface ITeam extends Document {
  _id: mongoose.Types.ObjectId;
  /** Identifiant d'URL, et clé de rattachement de l'effectif. */
  slug: string;
  name: string;
  category: TeamCategory;
  /** Tranche d'âge affichée en pastille : « Seniors », « 17–19 ». */
  ageRange: string;
  subtitle: string;
  description: string;
  coach: string;
  training: string;
  stadium: string;
  achievements: string[];
  stats: { wins: number; draws: number; losses: number };
  /** Année de création, affichée telle quelle. */
  established: string;
  image: string;
  rank: number;
  isVisible: boolean;
}

const teamSchema = new Schema<ITeam>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 80,
      // Le slug part dans une URL : on le tient à ce qui y voyage sans encodage.
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Identifiant invalide : minuscules, chiffres et tirets uniquement',
      ],
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, enum: TEAM_CATEGORIES, default: 'youth', index: true },
    ageRange: { type: String, trim: true, maxlength: 40, default: '' },
    subtitle: { type: String, trim: true, maxlength: 120, default: '' },
    description: { type: String, maxlength: 2000, default: '' },
    coach: { type: String, trim: true, maxlength: 120, default: '' },
    training: { type: String, trim: true, maxlength: 200, default: '' },
    stadium: { type: String, trim: true, maxlength: 200, default: '' },
    achievements: { type: [String], default: [] },
    stats: {
      wins: { type: Number, default: 0, min: 0 },
      draws: { type: Number, default: 0, min: 0 },
      losses: { type: Number, default: 0, min: 0 },
    },
    established: { type: String, trim: true, maxlength: 20, default: '' },
    image: { type: String, maxlength: 500, default: '' },
    // L'équipe première d'abord, puis les catégories par âge décroissant : ce
    // n'est ni l'ordre alphabétique ni celui de la création.
    rank: { type: Number, default: 0, index: true },
    isVisible: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    collection: 'teams',
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  }
);

export default mongoose.model<ITeam>('Team', teamSchema);
