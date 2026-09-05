/**
 * Commande passée depuis la boutique du site.
 *
 * Les lignes conservent le nom et le prix unitaire **au moment de la commande**
 * plutôt qu'une simple référence au produit : le catalogue vit, les prix
 * changent, un maillot est retiré de la vitrine — et une commande de l'an
 * dernier doit rester lisible telle qu'elle a été passée. La référence au
 * produit est gardée en plus, pour retrouver la fiche quand elle existe encore.
 *
 * Aucun encaissement en ligne : le club constate le règlement à la remise ou
 * par mobile money. `payment_method` dit ce qui était prévu, `status` ce qui
 * s'est réellement passé.
 */

import crypto from 'crypto';
import mongoose, { Document, Schema } from 'mongoose';

export const ORDER_STATUSES = ['recue', 'preparee', 'remise', 'annulee'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const FULFILMENTS = ['retrait', 'livraison'] as const;
export const PAYMENT_METHODS = ['a_la_remise', 'mobile_money'] as const;

export interface IOrderItem {
  product?: mongoose.Types.ObjectId;
  name: string;
  unit_price: number;
  size: string;
  quantity: number;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  reference: string;
  customer: { name: string; phone: string; email?: string };
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  fulfilment: (typeof FULFILMENTS)[number];
  address?: string;
  payment_method: (typeof PAYMENT_METHODS)[number];
  status: OrderStatus;
  note?: string;
  /** Compte supporter à l'origine de la commande, s'il était connecté. */
  placed_by?: mongoose.Types.ObjectId;
}

/**
 * Référence lisible à l'oral.
 *
 * Sans I, O, 0 ni 1 : le club lit ces références au téléphone, et confondre un
 * O avec un zéro coûte un appel de plus.
 */
export const generateReference = (): string => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const suffix = Array.from(crypto.randomBytes(6))
    .map((byte) => alphabet[byte % alphabet.length])
    .join('');
  return `CMD-${suffix}`;
};

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true, maxlength: 200 },
    unit_price: { type: Number, required: true, min: 0 },
    size: { type: String, default: '', maxlength: 20 },
    quantity: { type: Number, required: true, min: 1, max: 99 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    reference: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true, trim: true, maxlength: 120 },
      phone: { type: String, required: true, trim: true, maxlength: 40 },
      email: { type: String, trim: true, lowercase: true, maxlength: 255 },
    },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    fulfilment: { type: String, enum: FULFILMENTS, default: 'retrait' },
    address: { type: String, trim: true, maxlength: 300 },
    payment_method: { type: String, enum: PAYMENT_METHODS, default: 'a_la_remise' },
    status: { type: String, enum: ORDER_STATUSES, default: 'recue', index: true },
    note: { type: String, trim: true, maxlength: 1000 },
    placed_by: { type: Schema.Types.ObjectId, ref: 'SiteUser' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    collection: 'orders',
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  }
);

export default mongoose.model<IOrder>('Order', orderSchema);
