/**
 * Actualité du club.
 *
 * Le contenu éditorial du site, celui que fconnect n'expose pas publiquement.
 * Les champs reprennent le type `Article` du front : le site n'a alors aucune
 * traduction à faire, contrairement aux données venues de fconnect.
 */

import mongoose, { Document, Schema } from 'mongoose';

export const ARTICLE_CATEGORIES = ['Matchs', 'Transferts', 'Équipe', 'Club'] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export interface IComment {
  _id: mongoose.Types.ObjectId;
  author: string;
  content: string;
  timestamp: Date;
}

export interface IArticle extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: ArticleCategory;
  publishedAt: Date;
  author: string;
  status: 'draft' | 'published';
  comments: IComment[];
}

const commentSchema = new Schema<IComment>(
  {
    author: { type: String, required: true, trim: true, maxlength: 80 },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    timestamp: { type: Date, default: Date.now },
  },
  {
    _id: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  }
);

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true, maxlength: 250 },
    content: { type: String, default: '', maxlength: 50000 },
    excerpt: { type: String, default: '', maxlength: 1000 },
    image: { type: String, default: '', maxlength: 500 },
    category: { type: String, enum: ARTICLE_CATEGORIES, default: 'Club', index: true },
    // Date de parution affichée, distincte de la date de création : un article
    // peut être écrit aujourd'hui et daté d'un match d'il y a trois jours.
    publishedAt: { type: Date, default: Date.now, index: true },
    author: { type: String, default: 'ASC Cambérène', trim: true, maxlength: 120 },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    comments: { type: [commentSchema], default: [] },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    collection: 'articles',
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  }
);

articleSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

export default mongoose.model<IArticle>('Article', articleSchema);
