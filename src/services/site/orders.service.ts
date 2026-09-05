/**
 * Commandes de la boutique.
 *
 * La création est ouverte à tous : c'est la validation du panier. Le client
 * n'envoie que ses choix — quel produit, quelle taille, combien — et jamais un
 * prix : le serveur retarife depuis le catalogue, et c'est son total qui fait
 * foi. Le suivi, lui, exige le droit `orders:manage`.
 */

import { siteApi } from '../../lib/api';
import { Fulfilment, Order, OrderStatus, PaymentMethod } from '../../types';

export interface PlaceOrderPayload {
  customer: { name: string; phone: string; email?: string };
  items: { product_id: string; size: string; quantity: number }[];
  fulfilment: Fulfilment;
  address?: string;
  payment_method: PaymentMethod;
  note?: string;
}

export interface OrderListParams {
  search?: string;
  status?: OrderStatus | '';
  page?: number;
  limit?: number;
}

/** Libellés affichés ; le stockage garde des valeurs stables et sans accent. */
export const STATUS_LABELS: Record<OrderStatus, string> = {
  recue: 'Reçue',
  preparee: 'Préparée',
  remise: 'Remise',
  annulee: 'Annulée',
};

export const FULFILMENT_LABELS: Record<Fulfilment, string> = {
  retrait: 'Retrait au club',
  livraison: 'Livraison',
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  a_la_remise: 'À la remise',
  mobile_money: 'Mobile money',
};

export const placeOrder = async (payload: PlaceOrderPayload): Promise<Order> => {
  // `auth: true` sans être connecté ne joint rien : le jeton, s'il existe,
  // rattache simplement la commande au compte supporter.
  const response = await siteApi.post<{ success: boolean; data: Order }>('/orders', payload, {
    auth: true,
  });
  return response.data;
};

export const listOrders = async (
  params: OrderListParams = {},
  signal?: AbortSignal
): Promise<Order[]> => {
  const response = await siteApi.get<{ success: boolean; data: Order[] }>('/orders', {
    query: { ...params },
    auth: true,
    signal,
  });
  return response.data;
};

export const updateOrder = async (
  id: string,
  payload: { status?: OrderStatus; note?: string }
): Promise<Order> => {
  const response = await siteApi.put<{ success: boolean; data: Order }>(`/orders/${id}`, payload, {
    auth: true,
  });
  return response.data;
};
