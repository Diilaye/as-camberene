/**
 * Frais de livraison de la boutique.
 *
 * Jumeau de `src/lib/shipping.ts` côté site. Le panier affiche ces montants,
 * mais c'est le serveur qui les applique au moment d'enregistrer la commande :
 * un total calculé par le navigateur se modifie depuis la console.
 */

/** Montant d'achat à partir duquel la livraison est offerte, en FCFA. */
export const FREE_SHIPPING_THRESHOLD = 50_000;

/** Frais appliqués en dessous du seuil, en FCFA. */
export const SHIPPING_COST = 3_500;

/** Une commande retirée au club ne coûte rien à livrer. */
export const shippingFor = (subtotal: number, fulfilment: 'retrait' | 'livraison'): number =>
  fulfilment === 'retrait' || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
