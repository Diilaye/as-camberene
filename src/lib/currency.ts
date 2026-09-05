/**
 * Montants en francs CFA.
 *
 * Le franc CFA (XOF) n'a pas de sous-unité : un prix est un entier, et
 * l'afficher avec deux décimales n'a pas de sens. Le séparateur de milliers est
 * une espace insécable, pour qu'un montant ne se coupe jamais en fin de ligne.
 *
 * Tous les prix du site passent par ici — boutique, panier, abonnements — pour
 * qu'un changement de format n'ait qu'un seul endroit où se faire.
 */

/** Code ISO de la devise, si un jour un paiement doit l'annoncer. */
export const CURRENCY_CODE = 'XOF';

/** Suffixe affiché. « FCFA » est l'usage courant au Sénégal. */
export const CURRENCY_LABEL = 'FCFA';

const groupSeparator = ' '; // espace fine insécable

/** Nombre seul, groupé par milliers : `25 000`. */
export const formatAmount = (amount: number): string =>
  Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);

/** Montant complet : `25 000 FCFA`. */
export const formatCFA = (amount: number): string =>
  `${formatAmount(amount)} ${CURRENCY_LABEL}`;
