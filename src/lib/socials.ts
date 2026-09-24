import { Facebook, Instagram, LucideIcon, Twitter, Youtube } from 'lucide-react';
import { SiteSettings } from '../data/siteSettings';

export interface SocialLink {
  label: string;
  icon: LucideIcon;
  href: string;
}

/** Comptes du club saisis dans « Contenu du site » ; un lien vide est masqué. */
export const socialLinks = (settings: SiteSettings): SocialLink[] =>
  [
    { label: 'Facebook', icon: Facebook, href: settings.socials.facebook },
    { label: 'Instagram', icon: Instagram, href: settings.socials.instagram },
    { label: 'X', icon: Twitter, href: settings.socials.x },
    { label: 'YouTube', icon: Youtube, href: settings.socials.youtube },
  ].filter((link) => link.href.trim() !== '');
