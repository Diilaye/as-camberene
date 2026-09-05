/**
 * Comptes du site.
 *
 * Le rôle est porté par le compte et jamais par la requête : un client ne
 * choisit pas son rôle à l'inscription, la route publique fixe `subscriber`,
 * et seul un super administrateur en attribue d'autres. Ce que chaque rôle
 * autorise se lit dans `lib/roles.ts`.
 *
 * Ces comptes n'ont rien à voir avec ceux de fconnect : le site en est seul
 * dépositaire, c'est ce qui rend son administration autonome.
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, UserRole } from '../lib/roles';

export interface ISiteUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  favorite_team?: string;
  is_active: boolean;
  last_login_at?: Date;
  /** Compte qui a créé celui-ci ; absent pour une inscription publique. */
  created_by?: mongoose.Types.ObjectId;
  validatePassword(candidate: string): Promise<boolean>;
}

const siteUserSchema = new Schema<ISiteUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    // `select: false` : le haché ne part jamais dans une réponse par accident.
    // Les rares lectures qui en ont besoin le demandent explicitement.
    password_hash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'subscriber', index: true },
    favorite_team: { type: String, trim: true, maxlength: 120 },
    is_active: { type: Boolean, default: true },
    last_login_at: { type: Date },
    created_by: { type: Schema.Types.ObjectId, ref: 'SiteUser' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    collection: 'site_users',
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.password_hash;
        return ret;
      },
    },
  }
);

// Le hachage vit sur le modèle : aucun appelant ne peut l'oublier, qu'il vienne
// d'une route, d'un script de seed ou d'une console.
siteUserSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password_hash')) return next();
  this.password_hash = await bcrypt.hash(this.password_hash, 10);
  next();
});

siteUserSchema.methods.validatePassword = function validatePassword(
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password_hash);
};

export default mongoose.model<ISiteUser>('SiteUser', siteUserSchema);
