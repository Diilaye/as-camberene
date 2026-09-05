/**
 * Outils partagés par les adaptateurs.
 */

/** Âge en années révolues, `null` si la date manque ou n'est pas lisible. */
export const ageFrom = (dateOfBirth?: string | null): number | null => {
  if (!dateOfBirth) return null;

  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDelta = now.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) age -= 1;

  return age >= 0 ? age : null;
};

/** Partie date d'un horodatage ISO — le site affiche `2025-07-20`. */
export const isoDate = (value?: string | null): string => (value ? value.slice(0, 10) : '');

/** Nom complet à partir d'un prénom et d'un nom, sans espace parasite. */
export const fullName = (firstName?: string, lastName?: string): string =>
  [firstName, lastName].filter(Boolean).join(' ').trim();

/** Coupe un texte au mot près, pour les chapeaux d'article. */
export const excerptOf = (text: string, maxLength = 180): string => {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;

  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
};
