/**
 * Photo de la galerie du club.
 *
 * La galerie était une liste figée dans `src/components/TeamGallery.tsx` : le
 * club ne pouvait pas y ajouter la photo d'un match du week-end sans passer par
 * un développeur. Elle vit désormais en base.
 *
 * `category` range la photo dans l'un des onglets du site. `match` la rattache
 * en plus à une rencontre précise du calendrier, ce qui permet de présenter
 * l'album d'un match sous son affiche plutôt qu'en vrac. Ce rattachement reste
 * facultatif : une photo d'entraînement ou de vie du club n'en a pas.
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Onglets de la galerie.
 *
 * `stars` n'en fait pas partie : cet onglet-là présente l'effectif, pas des
 * photos de galerie — les joueurs mis en avant portent `isFeatured` sur leur
 * fiche, et c'est elle qui fournit le portrait.
 */
export const GALLERY_CATEGORIES = ['match', 'entrainement', 'club'] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export interface IGalleryItem extends Document {
  _id: mongoose.Types.ObjectId;
  image: string;
  title: string;
  description: string;
  category: GalleryCategory;
  /** Rencontre à laquelle la photo se rapporte. Absent hors catégorie `match`. */
  match?: mongoose.Types.ObjectId | null;
  /** Jour de la prise de vue, `AAAA-MM-JJ`. */
  date: string;
  rank: number;
  isVisible: boolean;
}

const galleryItemSchema = new Schema<IGalleryItem>(
  {
    image: { type: String, required: true, maxlength: 500 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    category: { type: String, enum: GALLERY_CATEGORIES, default: 'club', index: true },
    // `default: null` et non `undefined` : le formulaire doit pouvoir détacher
    // une photo de son match, et un champ absent ne détache rien.
    match: { type: Schema.Types.ObjectId, ref: 'Match', default: null, index: true },
    date: {
      type: String,
      trim: true,
      default: '',
      match: [/^(\d{4}-\d{2}-\d{2})?$/, 'La date doit être au format AAAA-MM-JJ'],
    },
    // Les albums se lisent du plus récent au plus ancien ; `rank` sert à
    // épingler une photo en tête de son onglet.
    rank: { type: Number, default: 0, index: true },
    isVisible: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    collection: 'gallery_items',
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        // L'identifiant du match part en chaîne : le site le compare à celui
        // qu'il a déjà, et un ObjectId sérialisé ne s'y compare pas.
        if (ret.match) ret.match = String(ret.match);
        return ret;
      },
    },
  }
);

export default mongoose.model<IGalleryItem>('GalleryItem', galleryItemSchema);
