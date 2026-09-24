import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Ticket, Trophy } from 'lucide-react';
import { useMatches } from '../hooks/useContent';
import { Match } from '../types';
import PageHero from '../components/ui/PageHero';
import { handleImageError } from '../lib/imagePlaceholder';

/** Durée après le coup d'envoi au-delà de laquelle une rencontre est jouée. */
const MATCH_LENGTH_MS = 3 * 60 * 60 * 1000;

const FILTERS = ['Tous', 'À venir', 'Résultats'] as const;
type Filter = (typeof FILTERS)[number];

const kickoff = (match: Match): number => new Date(`${match.date}T${match.time || '00:00'}:00`).getTime();

/**
 * Une rencontre est finie quand le club l'a marquée « Terminé » — ou, s'il a
 * oublié de le faire, trois heures après le coup d'envoi. Sans ce filet, un
 * match passé resterait « prochain match » jusqu'à la saisie du score.
 */
const isOver = (match: Match, now: number): boolean =>
  match.status === 'Terminé' || (match.status === 'À venir' && kickoff(match) + MATCH_LENGTH_MS < now);

const monthLabel = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

const dayLabel = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });

/** Score vu du club, et l'issue qui va avec. */
const outcomeOf = (match: Match) => {
  if (!match.result) return null;
  const home = match.venue === 'Domicile';
  const scored = home ? match.result.home : match.result.away;
  const conceded = home ? match.result.away : match.result.home;
  if (scored > conceded) return { label: 'V', title: 'Victoire', className: 'bg-club-green text-white' };
  if (scored < conceded) return { label: 'D', title: 'Défaite', className: 'bg-red-600 text-white' };
  return { label: 'N', title: 'Match nul', className: 'bg-white/20 text-white' };
};

/**
 * Calendrier de l'équipe : toutes les rencontres de la saison, dans l'ordre.
 *
 * Le prochain match porte une barre verte. Elle se place d'elle-même : c'est la
 * première rencontre qui n'est pas finie, si bien qu'un match marqué
 * « Terminé » dans l'administration la fait passer au suivant sans autre
 * manipulation.
 */
const Calendrier: React.FC = () => {
  // Les vrais matchs seulement : jamais la saison de démonstration.
  const { data: matches, loading } = useMatches({ withDemo: false });
  const [filter, setFilter] = useState<Filter>('Tous');
  // L'heure courante est relue chaque minute : la barre avance aussi quand un
  // match se termine pendant qu'on regarde la page.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const ordered = useMemo(() => [...matches].sort((a, b) => kickoff(a) - kickoff(b)), [matches]);
  const next = useMemo(() => ordered.find((match) => !isOver(match, now)), [ordered, now]);

  const visible = ordered.filter((match) =>
    filter === 'Tous' ? true : filter === 'À venir' ? !isOver(match, now) : isOver(match, now)
  );

  // Regroupement par mois, dans l'ordre du calendrier.
  const months = useMemo(() => {
    const groups: { label: string; matches: Match[] }[] = [];
    visible.forEach((match) => {
      const label = monthLabel(match.date);
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.matches.push(match);
      else groups.push({ label, matches: [match] });
    });
    return groups;
  }, [visible]);

  // À l'ouverture, on amène le prochain match à l'écran.
  const nextRef = useRef<HTMLElement>(null);
  const scrolled = useRef(false);
  useEffect(() => {
    if (scrolled.current || !nextRef.current) return;
    scrolled.current = true;
    nextRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [next]);

  const played = ordered.filter((match) => isOver(match, now)).length;
  const counts: Record<Filter, number> = { Tous: ordered.length, 'À venir': ordered.length - played, Résultats: played };

  return (
    <div className="bg-graphite">
      <PageHero
        kicker="Équipe A"
        title="Calendrier"
        description="Toutes les rencontres de la saison : le prochain match en vert, les résultats au fil des journées."
      />

      <section className="border-b border-white/10 bg-charcoal">
        <div className="site-container flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
                className={`rounded-full px-5 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                  filter === item ? 'bg-club-yellow text-black' : 'bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item} ({counts[item]})
              </button>
            ))}
          </div>
          <p className="text-sm text-white/50">
            {ordered.length} match{ordered.length > 1 ? 's' : ''} · {played} joué{played > 1 ? 's' : ''}
          </p>
        </div>
      </section>

      <section className="band-charcoal py-12">
        <div className="site-container max-w-4xl">
          {loading && matches.length === 0 ? (
            <p className="panel p-12 text-center text-white/60">Chargement du calendrier…</p>
          ) : months.length === 0 ? (
            <p className="panel p-12 text-center text-white/60">
              {filter === 'Tous' ? 'Le calendrier sera publié prochainement.' : 'Aucune rencontre dans cette catégorie.'}
            </p>
          ) : (
            <div className="space-y-10">
              {months.map((month) => (
                <div key={month.label}>
                  <h2 className="mb-4 text-lg font-extrabold uppercase tracking-wide text-white/80">{month.label}</h2>
                  <div className="space-y-3">
                    {month.matches.map((match) => {
                      const isNext = next?.id === match.id;
                      const over = isOver(match, now);
                      const live = match.status === 'En cours';
                      const outcome = over ? outcomeOf(match) : null;
                      const home = match.venue === 'Domicile';
                      return (
                        <article
                          key={String(match.id)}
                          ref={isNext ? nextRef : undefined}
                          className={`relative flex items-center gap-4 overflow-hidden rounded-[20px] border p-4 pl-6 transition-colors sm:gap-6 ${
                            isNext
                              ? 'border-green-400 bg-club-green/30 ring-2 ring-green-400/50'
                              : 'border-white/10 bg-white/[0.04]'
                          } ${over ? 'opacity-80' : ''}`}
                        >
                          {/* La barre verte du prochain match */}
                          {isNext && <span className="absolute inset-y-0 left-0 w-2 bg-green-400" aria-hidden />}

                          <div className="w-20 shrink-0 text-center">
                            <p className="text-xs uppercase text-white/60">{dayLabel(match.date)}</p>
                            {over && match.result ? (
                              <p className="text-2xl font-extrabold text-white">
                                {match.result.home}
                                <span className="text-white/40">-</span>
                                {match.result.away}
                              </p>
                            ) : (
                              <p className="text-xl font-extrabold text-club-yellow">{match.time}</p>
                            )}
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
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              {isNext && !live && (
                                <span className="rounded-full bg-green-400 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-black">
                                  Prochain match
                                </span>
                              )}
                              {live && (
                                <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> En direct
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-white/50">
                                <Trophy size={11} /> {match.competition}
                              </span>
                            </div>
                            <h3 className="truncate text-base font-extrabold uppercase text-white sm:text-lg">
                              {home ? `ASC Cambérène — ${match.opponent}` : `${match.opponent} — ASC Cambérène`}
                            </h3>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/50">
                              <MapPin size={11} /> {match.venue}
                            </p>
                          </div>

                          {outcome ? (
                            <span
                              title={outcome.title}
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${outcome.className}`}
                            >
                              {outcome.label}
                            </span>
                          ) : isNext && home ? (
                            <Link to="/billetterie" className="btn-yellow hidden shrink-0 sm:inline-flex">
                              <Ticket size={15} /> Billets
                            </Link>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Calendrier;
