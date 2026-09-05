/**
 * Frais de livraison de la boutique.
 *
 * Partagés entre le panier et la fiche produit : la promesse affichée sur la
 * fiche (« livraison gratuite dès… ») et le calcul du panier doivent venir du
 * même endroit, sinon l'une des deux ment.
 */

/** Montant d'achat à partir duquel la livraison est offerte, en FCFA. */
export const FREE_SHIPPING_THRESHOLD = 50_000;

/** Frais appliqués en dessous du seuil, en FCFA. */
export const SHIPPING_COST = 3_500;

/**
 * Frais pour un panier donné.
 *
 * Une commande retirée au club ne coûte rien à livrer. Le serveur applique la
 * même règle (`server/src/lib/shipping.ts`) : ce qui est calculé ici n'est
 * qu'un aperçu, le total qui engage est celui qu'il renvoie.
 */
export const shippingFor = (subtotal: number, fulfilment: 'retrait' | 'livraison'): number =>
  fulfilment === 'retrait' || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
