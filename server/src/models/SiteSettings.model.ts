/**
 * Contenu du site hors rubriques : un seul document.
 *
 * Les textes qui ne forment pas une liste — le bandeau du haut, les chiffres du
 * club, la bannière de l'accueil, les coordonnées — étaient écrits dans le
 * code, et chaque retouche demandait un développeur. Ils vivent ici, sous la
 * clé `site`, et l'onglet « Contenu du site » les édite.
 *
 * Le contenu est validé par Joi à l'écriture (`validators/settings.ts`) et
 * stocké tel quel : sa forme est celle que le site lit, et l'ajout d'un champ
 * ne demande pas de migration. Tant que rien n'a été enregistré, le site
 * affiche ses valeurs d'origine.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteSettings extends Document {
  key: string;
  content: Record<string, unknown>;
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: { type: String, required: true, unique: true, default: 'site' },
    content: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    collection: 'site_settings',
    minimize: false,
  }
);

export default mongoose.model<ISiteSettings>('SiteSettings', siteSettingsSchema);
