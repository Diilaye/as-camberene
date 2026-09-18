import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Facebook,
  Instagram,
  MapPin,
  Pause,
  Play,
  Twitter,
  Volume2,
  VolumeX,
  Youtube,
} from 'lucide-react';
import { partners } from '../data/heroSlides';
import { useArticles, useHeroSlides, useLegends, useMatches, useProducts } from '../hooks/useContent';
import { formatCFA } from '../lib/currency';
import { formatVideoTime, youtubeId } from '../lib/youtube';
import { handleImageError } from '../lib/imagePlaceholder';
import ArticleCard from '../components/ui/ArticleCard';
import HeroVideo from '../components/ui/HeroVideo';
import Rail from '../components/ui/Rail';
import SectionHeader from '../components/ui/SectionHeader';
import TeamGallery from '../components/TeamGallery';

const HERO_SOCIALS = [
  { label: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/p/Asc-camb%C3%A9r%C3%A8ne-officiel-100063673796089/' },
  { label: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/asc.camberene/' },
  { label: 'X', icon: Twitter, href: 'https://x.com/asccamberene' },
  { label: 'YouTube', icon: Youtube, href: 'https://youtube.com/@asccamberene' },
];

const CLUB_FACTS = [
  { value: '1965', label: 'Fondation' },
  { value: '8', label: 'Titres nationaux' },
  { value: '25K+', label: 'Supporters' },
  { value: 'L1', label: 'Championnat' },
];

const formatMatchDate = (value: string) =>
  new Date(value).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });

const Home: React.FC = () => {
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  /** Vidéos que YouTube a refusé de servir : la diapositive repasse en photo. */
  const [unavailable, setUnavailable] = useState<string[]>([]);

  /**
   * Diapositives préparées une fois : l'identifiant YouTube est extrait ici
   * pour que le rendu n'ait plus qu'à tester sa présence, et qu'un lien mal
   * formé retombe silencieusement sur la photo.
   */
  const { data: heroSlides } = useHeroSlides();

  const slides = useMemo(
    () =>
      heroSlides.map((item) => {
        const id = item.youtube ? youtubeId(item.youtube) : null;
        return { ...item, videoId: id && !unavailable.includes(id) ? id : null };
      }),
    [heroSlides, unavailable]
  );

  /**
   * Position affichée, ramenée dans les bornes de la liste.
   *
   * Les diapositives viennent du serveur : leur nombre change une fois la
   * réponse arrivée, et peut être plus petit que la position courante — le
   * club vient de supprimer la dernière, par exemple. Sans ce garde-fou, la
   * diapositive active serait `undefined` et l'accueil planterait sur son
   * titre. Borner à l'affichage plutôt que corriger l'état après coup évite
   * le rendu intermédiaire, celui qui casse.
   */
  const activeIndex = slides.length > 0 ? Math.min(slide, slides.length - 1) : 0;
  const active = slides[activeIndex];
  const isVideo = Boolean(active?.videoId);

  const goTo = useCallback(
    (index: number) => {
      setSlide((index + slides.length) % slides.length);
      setProgress({ current: 0, duration: 0 });
    },
    [slides.length]
  );

  /**
   * Avance automatique.
   *
   * Une photo tient six secondes ; une vidéo garde la main jusqu'à sa fin, que
   * `HeroVideo` signale. Sans cette distinction, le carrousel couperait la
   * vidéo au milieu.
   */
  useEffect(() => {
    if (!playing || isVideo) return undefined;
    const timer = setInterval(() => goTo(activeIndex + 1), 6000);
    return () => clearInterval(timer);
  }, [playing, isVideo, activeIndex, goTo]);

  const onVideoTime = useCallback((current: number, duration: number) => {
    setProgress({ current, duration });
  }, []);

  const { data: articles } = useArticles({ limit: 9 });
  const { data: products } = useProducts({ limit: 8 });
  const { data: legends } = useLegends({ limit: 8 });
  const { data: matches } = useMatches();

  const upcomingMatches = matches.filter((match) => match.status === 'À venir').slice(0, 3);
  const recentMatches = matches.filter((match) => match.status === 'Terminé').slice(0, 3);

  return (
    <div className="bg-graphite">
      {/* ------------------------------------------------------------------ *
       * Carrousel de tête
       * ------------------------------------------------------------------ */}
      <section className="relative h-[95vh] min-h-[520px] overflow-hidden bg-graphite xl:h-[56.25vw] xl:max-h-none">
        {slides.map((item, index) => (
          <div
            key={item.id}
            aria-hidden={index !== activeIndex}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeIndex ? 'opacity-100' : 'opacity-0'
            } ${item.image || item.videoId ? '' : 'band-green'}`}
          >
            {item.videoId ? (
              index === activeIndex && (
              <HeroVideo
                videoId={item.videoId}
                active
                playing={playing}
                muted={muted}
                onTime={onVideoTime}
                onEnded={() => goTo(index + 1)}
                onUnavailable={() =>
                  setUnavailable((current) =>
                    current.includes(item.videoId!) ? current : [...current, item.videoId!]
                  )
                }
              />
              )
            ) : (
              item.image && (
                <img
                  src={item.image}
                  alt=""
                  onError={handleImageError}
                  className="h-full w-full object-cover"
                />
              )
            )}
          </div>
        ))}

        {/*
          Double dégradé du modèle : un voile latéral pour détacher le texte, un
          fondu vertical vers le bas pour raccorder l'image au corps de page.
        */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(90deg, rgba(24,25,28,.3), rgba(24,25,28,.08) 85%, rgba(24,25,28,.5)), linear-gradient(rgba(24,25,28,0), rgba(24,25,28,.9) 99%)',
            boxShadow: 'inset 4px -57px 106px -35px #000',
          }}
        />

        {/* Colonne de réseaux sociaux, contre le bord droit */}
        <div className="absolute right-5 top-5 z-20 hidden flex-col items-center justify-center gap-[15px] md:flex lg:right-10">
          {HERO_SOCIALS.map(({ label, icon: Icon, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-white opacity-70 transition-opacity hover:opacity-100"
            >
              <Icon size={24} />
            </a>
          ))}
          <span className="mt-[15px] rotate-180 text-sm uppercase tracking-[2px] text-white/60 [writing-mode:vertical-rl]">
            Suivez-nous
          </span>
        </div>

        {/* Légende : surtitre jaune au-dessus du titre, calés à gauche */}
        <div className="absolute bottom-[3.25rem] left-5 z-20 flex h-[70vh] max-w-[40rem] flex-col justify-center pr-5 lg:left-10">
          <p className="text-shadow-hero text-xl font-bold uppercase leading-tight text-club-yellow md:text-[26px] lg:text-[32px] lg:leading-10">
            {active.kicker}
          </p>
          <h1 className="text-shadow-hero line-clamp-3 text-3xl font-extrabold uppercase leading-tight text-white md:text-5xl lg:text-[60px] lg:leading-[1.15]">
            {active.title}
          </h1>
          <Link to={active.link} className="btn-yellow mt-8 w-fit">
            {active.linkLabel}
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Lecture/pause au centre du cadre, pour les diapositives vidéo */}
        {isVideo && (
          <button
            type="button"
            onClick={() => setPlaying(!playing)}
            aria-label={playing ? 'Mettre la vidéo en pause' : 'Lire la vidéo'}
            className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-white opacity-80 transition-opacity hover:opacity-100"
          >
            {playing ? <Pause size={40} /> : <Play size={40} />}
          </button>
        )}

        {/* -------------------------------------------------------------- *
         * Bloc de contrôle bas : partenaires, flèches et pastilles
         * -------------------------------------------------------------- */}
        <div className="absolute bottom-8 left-1/2 z-20 flex w-full max-w-3xl -translate-x-1/2 flex-col items-center gap-4 px-4 lg:bottom-[60px]">
          {partners.length > 0 && (
            <div className="flex w-[70%] justify-around">
              {partners.map((partner) => (
                <a
                  key={partner.name}
                  href={partner.href ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-1.5 text-center"
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-[30px] w-auto brightness-0 invert transition-[filter] hover:filter-none"
                  />
                </a>
              ))}
            </div>
          )}

          <div className="flex w-full items-center justify-center gap-4 text-[#eee]">
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Diapositive précédente"
              className="flex h-3 items-center font-bold text-white transition-opacity hover:opacity-70"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2">
              {slides.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Diapositive ${index + 1}`}
                  aria-current={index === activeIndex}
                  className={`h-3 rounded-full border-2 border-transparent transition-all duration-700 ${
                    index === activeIndex ? 'w-[45px] bg-club-yellow opacity-70' : 'w-3 bg-white opacity-30 hover:opacity-60'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Diapositive suivante"
              className="flex h-3 items-center font-bold text-white transition-opacity hover:opacity-70"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/*
            Ligne de lecture, sous les pastilles : le modèle n'affiche pas de
            barre de progression sur son carrousel, mais la durée de la vidéo et
            la coupure du son. Le lien ouvre la vidéo complète sur YouTube.
          */}
          {isVideo ? (
            <div className="flex items-center gap-3 text-sm leading-[1.4] text-white">
              <button
                type="button"
                onClick={() => setPlaying(!playing)}
                aria-label={playing ? 'Mettre la vidéo en pause' : 'Lire la vidéo'}
                className="flex items-center gap-2 transition-opacity hover:opacity-70"
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <a
                href={`https://www.youtube.com/watch?v=${active.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-70"
              >
                Voir la vidéo complète : {formatVideoTime(progress.duration)}
              </a>
              <button
                type="button"
                onClick={() => setMuted(!muted)}
                aria-label={muted ? 'Activer le son' : 'Couper le son'}
                className="transition-opacity hover:opacity-70"
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(!playing)}
              aria-label={playing ? 'Mettre le carrousel en pause' : 'Relancer le carrousel'}
              className="text-white opacity-80 transition-opacity hover:opacity-100"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ *
       * Centre de match : prochaines rencontres et derniers résultats
       * ------------------------------------------------------------------ */}
      <section className="band-charcoal border-y border-white/5">
        <div className="site-container py-12">
          <SectionHeader title="Centre de match" linkLabel="Calendrier" linkTo="/teams" className="mb-8" />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="min-w-0">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-club-yellow">
                Prochaines rencontres
              </p>
              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <article key={String(match.id)} className="panel panel-hover flex items-center gap-4 p-4">
                    <div className="w-16 shrink-0 text-center">
                      <p className="text-xs uppercase text-white/50">{formatMatchDate(match.date)}</p>
                      <p className="text-lg font-extrabold text-club-yellow">{match.time}</p>
                    </div>
                    {match.image && (
                      <img
                        src={match.image}
                        alt=""
                        onError={handleImageError}
                        className="hidden h-14 w-14 shrink-0 rounded-lg border border-white/10 object-cover sm:block"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-extrabold uppercase text-white">
                        {match.venue === 'Domicile'
                          ? `ASC Cambérène — ${match.opponent}`
                          : `${match.opponent} — ASC Cambérène`}
                      </h3>
                      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {match.competition}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={13} />
                          {match.venue}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {match.time}
                        </span>
                      </p>
                    </div>
                    <Link
                      to={`/billetterie?match=${match.id}`}
                      className="btn-yellow shrink-0 px-4 py-2 text-xs"
                    >
                      Billets
                    </Link>
                  </article>
                ))}
                {upcomingMatches.length === 0 && (
                  <p className="panel p-6 text-sm text-white/60">Aucune rencontre programmée pour le moment.</p>
                )}
              </div>
            </div>

            <div className="min-w-0">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-club-yellow">
                Derniers résultats
              </p>
              <div className="space-y-3">
                {recentMatches.map((match) => {
                  const scored = match.venue === 'Domicile' ? match.result?.home : match.result?.away;
                  const conceded = match.venue === 'Domicile' ? match.result?.away : match.result?.home;
                  const outcome =
                    scored === undefined || conceded === undefined
                      ? null
                      : scored > conceded
                        ? { label: 'Victoire', className: 'bg-club-green text-white' }
                        : scored === conceded
                          ? { label: 'Nul', className: 'bg-white/15 text-white' }
                          : { label: 'Défaite', className: 'bg-red-500/20 text-red-300' };
                  const clubScorers = (match.scorers ?? []).filter(
                    (scorer) => scorer.side === 'club'
                  );

                  return (
                    <article key={String(match.id)} className="panel panel-hover flex items-center gap-4 p-4">
                      <div className="w-16 shrink-0 text-center text-2xl font-extrabold text-white">
                        {scored ?? '-'}<span className="text-white/40">:</span>{conceded ?? '-'}
                      </div>
                      {match.image && (
                        <img
                          src={match.image}
                          alt=""
                          onError={handleImageError}
                          className="hidden h-14 w-14 shrink-0 rounded-lg border border-white/10 object-cover sm:block"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-extrabold uppercase text-white">
                          {match.venue === 'Domicile'
                            ? `ASC Cambérène — ${match.opponent}`
                            : `${match.opponent} — ASC Cambérène`}
                        </h3>
                        <p className="mt-1 text-xs text-white/60">
                          {match.competition} · {formatMatchDate(match.date)}
                        </p>
                        {/*
                          Les buteurs du club seulement : la carte est étroite,
                          et c'est le renseignement qu'on vient y chercher. La
                          feuille complète, adversaire compris, appartient à la
                          page du match le jour où elle existera.
                        */}
                        {clubScorers.length > 0 && (
                          <p className="mt-1 truncate text-xs text-club-yellow/80">
                            {clubScorers
                              .map((scorer) =>
                                scorer.minute ? `${scorer.name} ${scorer.minute}’` : scorer.name
                              )
                              .join(' · ')}
                          </p>
                        )}
                      </div>
                      {outcome && <span className={`chip shrink-0 ${outcome.className}`}>{outcome.label}</span>}
                    </article>
                  );
                })}
                {recentMatches.length === 0 && (
                  <p className="panel p-6 text-sm text-white/60">Aucun résultat enregistré pour le moment.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ *
       * Actualités : le rail éditorial, sur la bande du club
       * ------------------------------------------------------------------ */}
      <section className="band-green py-8">
        <div className="site-container">
          <SectionHeader title="Actualités" linkLabel="Toutes les actualités" linkTo="/news" className="mb-8" />
        </div>
        <div className="site-container">
          <Rail>
            {articles.map((article, index) => (
              <ArticleCard
                key={String(article.id)}
                to={`/news/${article.id}`}
                image={article.image}
                kicker={article.category}
                title={article.title}
                date={article.publishedAt}
                /* Une carte sur trois passe en paysage, comme dans le modèle. */
                wide={(index + 1) % 3 === 0}
              />
            ))}
          </Rail>
        </div>
      </section>

      {/* ------------------------------------------------------------------ *
       * Chiffres du club
       * ------------------------------------------------------------------ */}
      <section className="band-graphite">
        <div className="site-container grid grid-cols-2 gap-6 py-12 md:grid-cols-4">
          {CLUB_FACTS.map((fact) => (
            <div key={fact.label} className="text-center">
              <p className="text-4xl font-extrabold text-club-yellow md:text-5xl">{fact.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/50">{fact.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ *
       * Boutique
       * ------------------------------------------------------------------ */}
      <section className="band-charcoal py-8">
        <div className="site-container">
          <SectionHeader title="Boutique officielle" linkLabel="Toute la collection" linkTo="/shop" className="mb-8" />
          <Rail>
            {products.map((product, index) => (
              <ArticleCard
                key={String(product.id)}
                to={`/shop/${product.id}`}
                image={product.image}
                kicker={product.type}
                title={product.name}
                note={formatCFA(product.price)}
                wide={(index + 1) % 3 === 0}
              />
            ))}
          </Rail>
        </div>
      </section>

      {/* ------------------------------------------------------------------ *
       * Bannière image : l'équipe de la saison
       * ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden">
        <img
          src="/assets/img/asc-camberene-equipe-2025.webp"
          alt="Effectif de l'ASC Cambérène"
          onError={handleImageError}
          className="h-[420px] w-full object-cover md:h-[520px]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(24,25,28,.9), rgba(24,25,28,.3) 75%), linear-gradient(rgba(24,25,28,0), rgba(24,25,28,.9) 99%)',
          }}
        />
        <div className="site-container absolute inset-0 flex flex-col justify-center">
          <div className="max-w-xl">
            <p className="text-shadow-hero text-lg font-bold uppercase text-club-yellow md:text-2xl">
              Effectif 2025
            </p>
            <h2 className="text-shadow-hero mt-2 text-3xl font-extrabold uppercase text-white md:text-5xl">
              Le groupe qui a ramené le club en Ligue 1
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/players" className="btn-yellow">Voir l'effectif</Link>
              <Link to="/teams" className="btn-ghost">Toutes les équipes</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ *
       * Légendes
       * ------------------------------------------------------------------ */}
      <section className="band-green py-8">
        <div className="site-container">
          <SectionHeader title="Légendes du club" linkLabel="Hall of Fame" linkTo="/legends" className="mb-8" />
          <Rail>
            {legends.map((legend, index) => (
              <ArticleCard
                key={String(legend.id)}
                to={`/legends/${legend.id}`}
                image={legend.photo}
                kicker={legend.position}
                title={legend.name}
                note={legend.period}
                wide={(index + 1) % 3 === 0}
              />
            ))}
          </Rail>
        </div>
      </section>

      {/* Galerie de l'équipe */}
      <TeamGallery />
    </div>
  );
};

export default Home;
