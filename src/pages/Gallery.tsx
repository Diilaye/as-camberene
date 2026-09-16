import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star, X } from 'lucide-react';
import { useGallery, useMatches, useTeamMembers } from '../hooks/useContent';
import { GALLERY_CATEGORIES, GALLERY_CATEGORY_LABELS, GalleryItem, TeamMember } from '../types';
import { handleImageError, IMAGE_PLACEHOLDER } from '../lib/imagePlaceholder';
import PageHero from '../components/ui/PageHero';
import galleryHero from '../../assets/img/asc-camberene-equipe-2025.webp';

type Tab = (typeof GALLERY_CATEGORIES)[number] | 'stars';

const TABS: { id: Tab; label: string }[] = [
  ...GALLERY_CATEGORIES.map((category) => ({
    id: category as Tab,
    label: GALLERY_CATEGORY_LABELS[category],
  })),
  { id: 'stars', label: 'Nos stars' },
];

const formatDate = (value?: string): string =>
  value
    ? new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

/**
 * Galerie du club.
 *
 * Trois onglets de photos — matchs, entraînements, vie du club — et un
 * quatrième qui présente l'effectif.
 *
 * « Nos stars » ne contient pas de photos de galerie : il affiche les joueurs
 * cochés « vedette » dans l'administration, avec leur portrait et un lien vers
 * leur fiche. Le club tient déjà ces portraits à jour dans l'Effectif ; les
 * redemander ici aurait créé deux vérités pour un même visage.
 *
 * Dans l'onglet Matchs, les photos rattachées à une rencontre sont regroupées
 * sous son affiche : un album par match plutôt qu'un mur indistinct.
 */
const Gallery: React.FC = () => {
  const [tab, setTab] = useState<Tab>('match');
  const [zoomed, setZoomed] = useState<GalleryItem | null>(null);

  const { data: photos, loading } = useGallery();
  const { data: matches } = useMatches();
  const { data: members } = useTeamMembers();

  const stars = useMemo(() => members.filter((member) => member.isFeatured), [members]);

  const visible = useMemo(
    () => photos.filter((photo) => photo.category === tab),
    [photos, tab]
  );

  /**
   * Photos de match, groupées par rencontre.
   *
   * Celles qu'aucune rencontre ne réclame ferment la liste : une photo mal
   * rangée doit rester visible, pas disparaître parce qu'il lui manque un lien.
   */
  const albums = useMemo(() => {
    if (tab !== 'match') return [];
    const groups = new Map<string, { label: string; date: string; photos: GalleryItem[] }>();

    visible.forEach((photo) => {
      const match = photo.match
        ? matches.find((entry) => String(entry.id) === String(photo.match))
        : undefined;
      const key = match ? String(match.id) : 'autres';
      const label = match
        ? match.venue === 'Domicile'
          ? `ASC Cambérène — ${match.opponent}`
          : `${match.opponent} — ASC Cambérène`
        : 'Autres photos de match';

      if (!groups.has(key)) {
        groups.set(key, { label, date: match?.date ?? '', photos: [] });
      }
      groups.get(key)!.photos.push(photo);
    });

    return [...groups.values()].sort((a, b) => b.date.localeCompare(a.date));
  }, [tab, visible, matches]);

  const photoCard = (photo: GalleryItem) => (
    <button
      key={String(photo.id)}
      type="button"
      onClick={() => setZoomed(photo)}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left transition hover:border-club-yellow/40"
    >
      <img
        src={photo.image}
        alt={photo.title}
        onError={handleImageError}
        loading="lazy"
        className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-graphite/95 to-transparent p-4">
        <p className="font-extrabold uppercase text-white">{photo.title}</p>
        {photo.date && <p className="text-[11px] text-white/60">{formatDate(photo.date)}</p>}
      </div>
    </button>
  );

  const starCard = (member: TeamMember) => (
    <Link
      key={member.id}
      to={`/players/${member.id}`}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-club-yellow/40"
    >
      <div className="relative">
        <img
          src={member.photo || IMAGE_PLACEHOLDER}
          alt={member.name}
          onError={handleImageError}
          loading="lazy"
          className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {member.kind === 'player' && member.number > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-club-yellow px-3 py-1 text-sm font-extrabold text-black">
            {member.number}
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-extrabold uppercase text-white">{member.name}</p>
        <p className="text-xs text-white/60">
          {member.kind === 'staff' ? member.role : member.position || member.line}
        </p>
      </div>
    </Link>
  );

  return (
    <div className="bg-graphite">
      <PageHero
        kicker="En images"
        title="Galerie"
        description="Les matchs, les entraînements et les visages du club."
        image={galleryHero}
      />

      <section className="site-container py-12">
        <div className="mb-8 flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-pressed={tab === item.id}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition ${
                tab === item.id
                  ? 'bg-club-yellow text-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {item.id === 'stars' && <Star size={14} />}
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'stars' ? (
          stars.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{stars.map(starCard)}</div>
          ) : (
            <p className="panel p-8 text-center text-sm text-white/60">
              Les joueurs mis en avant apparaîtront ici.
            </p>
          )
        ) : loading ? (
          <p className="panel p-8 text-center text-sm text-white/60">Chargement des photos…</p>
        ) : visible.length === 0 ? (
          <p className="panel p-8 text-center text-sm text-white/60">
            Aucune photo dans cette rubrique pour le moment.
          </p>
        ) : tab === 'match' ? (
          <div className="space-y-10">
            {albums.map((album) => (
              <div key={album.label + album.date}>
                <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="text-lg font-extrabold uppercase text-white">{album.label}</h2>
                  {album.date && (
                    <span className="flex items-center gap-1.5 text-xs text-club-yellow">
                      <Calendar size={13} />
                      {formatDate(album.date)}
                    </span>
                  )}
                  <span className="text-xs text-white/40">{album.photos.length} photo(s)</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {album.photos.map(photoCard)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.map(photoCard)}</div>
        )}
      </section>

      {/* Photo en grand */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/95 p-4"
          onClick={() => setZoomed(null)}
        >
          <button
            type="button"
            onClick={() => setZoomed(null)}
            aria-label="Fermer"
            className="absolute right-6 top-6 text-white/70 hover:text-white"
          >
            <X size={24} />
          </button>
          <figure className="max-h-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <img
              src={zoomed.image}
              alt={zoomed.title}
              onError={handleImageError}
              className="max-h-[75vh] w-full rounded-2xl object-contain"
            />
            <figcaption className="mt-4 text-center">
              <p className="text-lg font-extrabold uppercase text-white">{zoomed.title}</p>
              {zoomed.description && (
                <p className="mt-1 text-sm text-white/70">{zoomed.description}</p>
              )}
              {zoomed.date && (
                <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-club-yellow">
                  <MapPin size={12} />
                  {formatDate(zoomed.date)}
                </p>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
};

export default Gallery;
