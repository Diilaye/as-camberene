/**
 * Membre d'une équipe : joueur ou encadrant.
 *
 * ── Pourquoi ici, et non dans fconnect ─────────────────────────────────────
 *
 * L'effectif devait venir de fconnect, qui est l'outil de licence du club. Il
 * n'y est pas relié — `VITE_CLUB_ID` est vide, en développement comme en
 * production — et le site affichait donc un effectif de démonstration figé que
 * personne ne pouvait corriger. Le club saisit désormais son effectif ici.
 *
 * Si fconnect est branché un jour, c'est cette collection qu'il faudra
 * reprendre ou retirer : deux sources pour le même joueur se contrediraient.
 *
 * ── Joueurs et encadrement dans la même collection ─────────────────────────
 *
 * `kind` les distingue. Ils partagent la fiche — un nom, une photo, une
 * équipe — et se listent côte à côte dans l'écran d'équipe ; les séparer
 * imposerait deux modèles jumeaux et deux écrans pour la même saisie.
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Équipes d'origine du club.
 *
 * Ce n'est plus la liste des équipes possibles : celles-ci vivent dans `Team`,
 * et le club en ajoute depuis l'administration. Cette constante ne sert plus
 * qu'à amorcer une base neuve et à nommer les équipes livrées avec le site.
 */
export const PLAYER_TEAMS = [
  'equipe-a',
  'equipe-u19',
  'equipe-u17',
  'equipe-u15',
  'equipe-u12',
] as const;

/**
 * Ligne de jeu, qui sert au regroupement dans les pages d'équipe.
 *
 * `position` reste libre à côté ("Ailier gauche", "Milieu défensif") : c'est le
 * détail que le club écrit comme il l'entend, et il ne peut pas servir à
 * trier. La ligne, elle, est fermée.
 */
export const PLAYER_LINES = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'] as const;

export const PLAYER_KINDS = ['player', 'staff'] as const;

export const PLAYER_STATUSES = ['actif', 'blessé', 'suspendu', 'prêté', 'inactif'] as const;

export const STRONG_FEET = ['droit', 'gauche', 'les deux'] as const;

export interface IPlayer extends Document {
  _id: mongoose.Types.ObjectId;
  kind: (typeof PLAYER_KINDS)[number];
  name: string;
  /** Slug de l'équipe (`Team.slug`) à laquelle la fiche est rattachée. */
  team: string;
  number: number;
  line: (typeof PLAYER_LINES)[number];
  position: string;
  /** Fonction de l'encadrant ; vide pour un joueur. */
  role: string;
  photo: string;
  status: (typeof PLAYER_STATUSES)[number];
  birthDate: Date | null;
  nationality: string;
  height: number;
  weight: number;
  strongFoot: (typeof STRONG_FEET)[number] | '';
  stats: {
    matches: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
  };
  biography: string;
  joinedYear: number;
  /** Ordre d'affichage dans sa ligne ; à défaut, le numéro puis le nom. */
  rank: number;
  isVisible: boolean;
}

const playerSchema = new Schema<IPlayer>(
  {
    kind: { type: String, enum: PLAYER_KINDS, default: 'player', index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    // Le slug d'une équipe, et non plus une valeur d'une liste fermée : une
    // équipe créée dans l'administration doit pouvoir recevoir des joueurs le
    // jour même. Le formulaire propose les équipes existantes ; l'intégrité se
    // joue là, et une fiche orpheline se réaffecte en deux clics — ce qu'une
    // énumération, elle, rendait simplement impossible.
    team: { type: String, required: true, trim: true, maxlength: 80, index: true },
    // 0 vaut « pas de numéro » : l'encadrement n'en porte pas, et une recrue
    // peut être inscrite avant que le sien ne soit arrêté.
    number: { type: Number, default: 0, min: 0, max: 99 },
    line: { type: String, enum: PLAYER_LINES, default: 'Milieu', index: true },
    position: { type: String, default: '', maxlength: 100 },
    role: { type: String, default: '', maxlength: 100 },
    photo: { type: String, default: '', maxlength: 500 },
    status: { type: String, enum: PLAYER_STATUSES, default: 'actif', index: true },
    // La date plutôt que l'âge : un âge saisi une fois devient faux l'année
    // suivante, et personne ne repasse sur les fiches pour l'incrémenter.
    birthDate: { type: Date, default: null },
    nationality: { type: String, default: '', maxlength: 100 },
    height: { type: Number, default: 0, min: 0, max: 260 },
    weight: { type: Number, default: 0, min: 0, max: 200 },
    strongFoot: { type: String, enum: [...STRONG_FEET, ''], default: '' },
    stats: {
      matches: { type: Number, default: 0, min: 0 },
      goals: { type: Number, default: 0, min: 0 },
      assists: { type: Number, default: 0, min: 0 },
      yellowCards: { type: Number, default: 0, min: 0 },
      redCards: { type: Number, default: 0, min: 0 },
    },
    biography: { type: String, default: '', maxlength: 10000 },
    joinedYear: { type: Number, default: 0, min: 0 },
    rank: { type: Number, default: 0 },
    // Retirer un joueur de la vitrine sans effacer sa fiche : une fin de saison
    // n'est pas une suppression, et son historique peut resservir.
    isVisible: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    collection: 'players',
    toJSON: {
      // `age` est calculé à la lecture, jamais stocké : la fiche reste juste
      // sans que personne n'ait à la rouvrir le jour de l'anniversaire.
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  }
);

playerSchema.virtual('age').get(function (this: IPlayer): number {
  if (!this.birthDate) return 0;
  const now = new Date();
  const birth = new Date(this.birthDate);
  let age = now.getFullYear() - birth.getFullYear();
  // Anniversaire pas encore passé cette année : on retire l'année en trop.
  const monthDelta = now.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age > 0 ? age : 0;
});

// Un numéro ne peut pas être porté deux fois dans la même équipe. L'index
// partiel laisse passer les 0 — l'encadrement et les fiches sans numéro.
playerSchema.index(
  { team: 1, number: 1 },
  { unique: true, partialFilterExpression: { number: { $gt: 0 }, kind: 'player' } }
);

export default mongoose.model<IPlayer>('Player', playerSchema);
