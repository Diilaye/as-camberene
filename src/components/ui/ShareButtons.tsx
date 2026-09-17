import React, { useState } from 'react';
import { Check, Facebook, Link2, MessageCircle, Share2, Twitter } from 'lucide-react';

interface Props {
  /** Adresse à partager. Par défaut, celle de la page courante. */
  url?: string;
  /** Titre repris dans le message pré-rempli. */
  title: string;
  /** Libellé affiché devant les boutons. */
  label?: string;
  className?: string;
}

/**
 * Partage d'une page vers les réseaux.
 *
 * Trois réseaux et le presse-papier, plus le partage natif du téléphone quand
 * il existe : sur mobile, `navigator.share` ouvre la feuille du système, qui
 * connaît les applications réellement installées — bien plus utile qu'une
 * rangée de boutons figée.
 *
 * Ce que ces boutons transmettent, c'est un lien. L'image et le titre qui
 * apparaîtront dans l'aperçu ne viennent pas d'ici : le réseau va les chercher
 * lui-même en lisant les balises `og:` de la page. C'est le serveur qui les
 * fournit — voir `server/src/routes/share.routes.ts`.
 */
const ShareButtons: React.FC<Props> = ({ url, title, label = 'Partager', className = '' }) => {
  const [copied, setCopied] = useState(false);

  // `window` n'existe qu'au rendu : l'adresse est lue à l'usage, pas au montage.
  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const networks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'X',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papier refusé — page non sécurisée, permission refusée : on ne
      // bloque pas le partage pour autant, les boutons réseaux restent là.
    }
  };

  const shareNatively = async () => {
    try {
      await navigator.share({ title, url: shareUrl });
    } catch {
      /* partage annulé par la personne : rien à signaler */
    }
  };

  const buttonClass =
    'flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-club-yellow hover:text-black';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {label && (
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-white/50">
          {label}
        </span>
      )}

      {networks.map(({ name, icon: Icon, href }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={`Partager sur ${name}`}
          title={`Partager sur ${name}`}
          className={buttonClass}
        >
          <Icon size={16} />
        </a>
      ))}

      <button
        type="button"
        onClick={copy}
        aria-label="Copier le lien"
        title={copied ? 'Lien copié' : 'Copier le lien'}
        className={buttonClass}
      >
        {copied ? <Check size={16} /> : <Link2 size={16} />}
      </button>

      {/* Feuille de partage du système : présente surtout sur mobile. */}
      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
        <button
          type="button"
          onClick={shareNatively}
          aria-label="Partager"
          title="Partager"
          className={`${buttonClass} sm:hidden`}
        >
          <Share2 size={16} />
        </button>
      )}
    </div>
  );
};

export default ShareButtons;
