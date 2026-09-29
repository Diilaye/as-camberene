import { Facebook, Instagram, LucideIcon, Twitter, Youtube } from 'lucide-react';
import { SiteSettings } from '../data/siteSettings';

export interface SocialLink {
  label: string;
  icon: LucideIcon;
  href: string;
}

/**
 * Lien saisi dans l'administration, rendu sûr pour un `href`.
 *
 * Le serveur refuse déjà tout ce qui n'est pas `https://` ou une page du site ;
 * ce second filtre couvre un réglage enregistré avant cette règle. Tout autre
 * schéma — `javascript:` en tête — devient un lien vide.
 */
export const safeHref = (value: string | undefined): string => {
  const href = (value ?? '').trim();
  return /^(https?:\/\/|\/(?!\/))/i.test(href) ? href : '';
};

/** Comptes du club saisis dans « Contenu du site » ; un lien vide est masqué. */
export const socialLinks = (settings: SiteSettings): SocialLink[] =>
  [
    { label: 'Facebook', icon: Facebook, href: safeHref(settings.socials.facebook) },
    { label: 'Instagram', icon: Instagram, href: safeHref(settings.socials.instagram) },
    { label: 'X', icon: Twitter, href: safeHref(settings.socials.x) },
    { label: 'YouTube', icon: Youtube, href: safeHref(settings.socials.youtube) },
  ].filter((link) => link.href !== '');
