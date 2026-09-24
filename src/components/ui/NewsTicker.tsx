import React from 'react';
import { Link } from 'react-router-dom';
import { useArticles } from '../../hooks/useContent';

/** Secondes d'écran par titre : assez lent pour être lu en passant. */
const SECONDS_PER_TITLE = 6;
/** Titres par copie au minimum, pour couvrir un grand écran. */
const MIN_TITLES = 8;

/**
 * Bandeau des titres d'actualité, qui défilent de droite à gauche en boucle.
 *
 * La liste est rendue deux fois à la suite et l'ensemble glisse de la moitié
 * de sa largeur : quand la première copie sort à gauche, la seconde occupe
 * exactement sa place, et la boucle reprend sans saut visible. Le survol met en
 * pause, pour laisser le temps de cliquer sur un titre.
 */
const NewsTicker: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data: articles } = useArticles({ limit: 50 });

  if (articles.length === 0) return null;

  // Peu d'actualités ne rempliraient pas la largeur de l'écran, et un trou
  // passerait dans la boucle : on répète la liste jusqu'à MIN_TITLES titres.
  const base = Array.from({ length: Math.ceil(MIN_TITLES / articles.length) }, () => articles).flat();
  const duration = base.length * SECONDS_PER_TITLE;

  const renderTitles = (copy: number) =>
    base.map((article, index) => {
      // Les répétitions n'existent que pour la boucle : hors du parcours clavier
      // et des lecteurs d'écran, qui liraient sinon chaque titre plusieurs fois.
      const repeat = copy > 0 || index >= articles.length;
      return (
      <Link
        key={`${copy}-${index}`}
        to={`/news/${article.id}`}
        tabIndex={repeat ? -1 : undefined}
        aria-hidden={repeat ? true : undefined}
        className="flex shrink-0 items-center gap-3 px-6 text-sm font-bold uppercase tracking-wide text-white/85 transition-colors hover:text-club-yellow"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-club-yellow" aria-hidden />
        {article.title}
      </Link>
      );
    });

  return (
    <section className={`flex items-stretch overflow-hidden border-y border-white/10 bg-charcoal ${className}`} aria-label="Titres de l'actualité">
      <span className="z-10 flex shrink-0 items-center bg-club-yellow px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-black">
        Actualités
      </span>
      <div className="group relative flex-1 overflow-hidden">
        <div
          className="flex w-max animate-ticker py-3 group-hover:[animation-play-state:paused]"
          style={{ animationDuration: `${duration}s` }}
        >
          {renderTitles(0)}
          {renderTitles(1)}
        </div>
      </div>
    </section>
  );
};

export default NewsTicker;
