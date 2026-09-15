/**
 * Diapositive du carrousel de tête.
 *
 * La première chose qu'un visiteur voit de la page d'accueil. Elle porte soit
 * une photo (`image`), soit une vidéo YouTube (`youtube`) — jamais les deux à
 * l'écran : la vidéo l'emporte, et la photo sert alors d'affiche le temps que
 * le lecteur se charge, puis de repli si YouTube refuse de servir la vidéo.
 *
 * `youtube` est stocké tel que le club l'a saisi — identifiant nu, lien de la
 * barre d'adresse, lien de partage `youtu.be`, `/embed/` ou `/shorts/`. C'est
 * le site qui en extrait l'identifiant (`src/lib/youtube.ts`) : normaliser ici
 * obligerait à redéployer le serveur le jour où YouTube ajoute une forme de
 * lien, alors que le site, lui, retombe simplement sur la photo.
 *
 * Ce contenu remplace le tableau autrefois figé dans `src/data/heroSlides.ts`,
 * qui demandait un développeur pour changer une image. Ce tableau reste le
 * repli du site quand l'API ne répond pas.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IHeroSlide extends Document {
  _id: mongoose.Types.ObjectId;
  /** Photo de fond. Affiche de la vidéo quand `youtube` est renseigné. */
  image?: string;
  /** Identifiant ou lien YouTube. La diapositive devient alors une vidéo. */
  youtube?: string;
  /** Surtitre jaune, en capitales. */
  kicker: string;
  /** Titre blanc, en capitales, sur trois lignes au plus. */
  title: string;
  /** Destination du bouton. Chemin interne (`/news`) ou adresse complète. */
  link: string;
  linkLabel: string;
  /** Ordre d'apparition : les petits nombres passent devant. */
  rank: number;
  /** Retirer une diapositive de la vitrine sans la supprimer. */
  isVisible: boolean;
}

const heroSlideSchema = new Schema<IHeroSlide>(
  {
    image: { type: String, trim: true, maxlength: 500 },
    youtube: { type: String, trim: true, maxlength: 500 },
    kicker: { type: String, required: true, trim: true, maxlength: 80 },
    title: { type: String, required: true, trim: true, maxlength: 250 },
    link: { type: String, trim: true, maxlength: 500, default: '/news' },
    linkLabel: { type: String, trim: true, maxlength: 80, default: 'En savoir plus' },
    rank: { type: Number, default: 0, index: true },
    isVisible: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    collection: 'hero_slides',
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  }
);

export default mongoose.model<IHeroSlide>('HeroSlide', heroSlideSchema);
