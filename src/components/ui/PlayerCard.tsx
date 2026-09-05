import React from 'react';
import { Link } from 'react-router-dom';
import { handleImageError } from '../../lib/imagePlaceholder';

interface PlayerCardProps {
  to?: string;
  photo: string;
  name: string;
  position?: string;
  number?: number;
  /** Ligne d'appoint : âge, nationalité, rôle au sein du staff. */
  meta?: string;
}

/**
 * Vignette de joueur.
 *
 * Photo en portrait, numéro en très gros filigrane dans l'angle et nom en
 * capitales sur le bandeau bas — la fiche d'effectif du modèle. Sans `to`, la
 * carte reste un simple bloc : les catégories de jeunes n'ont pas de fiche.
 */
const PlayerCard: React.FC<PlayerCardProps> = ({ to, photo, name, position, number, meta }) => {
  const content = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden bg-graphite-light">
        <img
          src={photo}
          alt={name}
          loading="lazy"
          onError={handleImageError}
          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {number !== undefined && (
          <span className="absolute bottom-2 right-3 text-5xl font-extrabold leading-none text-white/25">
            {number}
          </span>
        )}
      </div>
      <div className="relative p-4">
        <span className="absolute inset-x-0 top-0 block h-[2px]"
              style={{ background: 'linear-gradient(90deg, var(--club-yellow) 60%, var(--club-green))' }} />
        {position && <p className="text-xs font-extrabold uppercase text-club-yellow">{position}</p>}
        <h3 className="mt-0.5 truncate text-base font-extrabold uppercase text-white">{name}</h3>
        {meta && <p className="mt-1 text-xs text-white/50">{meta}</p>}
      </div>
    </>
  );

  const className =
    'group block overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.04] transition-colors hover:border-club-yellow/40';

  return to ? (
    <Link to={to} className={className}>{content}</Link>
  ) : (
    <div className={className}>{content}</div>
  );
};

export default PlayerCard;
