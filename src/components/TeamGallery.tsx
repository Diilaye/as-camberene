import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Minus, Plus, X, ZoomIn } from 'lucide-react';
import SectionHeader from './ui/SectionHeader';
import { useGallery, useMatches } from '../hooks/useContent';
import { handleImageError } from '../lib/imagePlaceholder';
import { GALLERY_CATEGORIES, GALLERY_CATEGORY_LABELS, GalleryCategory, GalleryItem } from '../types';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title: string;
  date: string;
  description: string;
}

type TabId = GalleryCategory;


const PREVIEW_COUNT = 4;


const formatDate = (value?: string): string =>
  value
    ? new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

const toImage = (photo: GalleryItem): GalleryImage => ({
  id: String(photo.id),
  src: photo.image,
  alt: photo.title,
  title: photo.title,
  date: formatDate(photo.date),
  description: photo.description ?? '',
});


const byMostRecent = (a: GalleryItem, b: GalleryItem): number =>
  (b.createdAt ?? '').localeCompare(a.createdAt ?? '') || (b.rank ?? 0) - (a.rank ?? 0);


const FALLBACK: GalleryImage[] = [
  {
    id: '1',
    src: '/assets/img/asc-camberene-equipe-2025.webp',
    alt: "Effectif de l'ASC Cambérène en 2025",
    title: 'Effectif 2025',
    date: 'Juin 2025',
    description:
      "Photo officielle de l'effectif pour la saison 2025, celle de la montée en Ligue 1.",
  },
  {
    id: '2',
    src: '/assets/img/vue-du-ballon-de-football.jpg',
    alt: 'Ballon de football sur la pelouse',
    title: 'Préparation',
    date: 'Mai 2025',
    description: "Séances d'entraînement de la reprise, au stade municipal de Cambérène.",
  },
  {
    id: '3',
    src: '/assets/img/vue-du-t-shirt-du-joueur-de-football.jpg',
    alt: 'Maillot du club',
    title: 'Maillot 2025',
    date: 'Avril 2025',
    description: 'Présentation du maillot officiel de la saison 2025.',
  },
  {
    id: '4',
    src: '/assets/img/stade.jpg',
    alt: 'Stade municipal de Cambérène',
    title: 'Stade municipal',
    date: 'Mars 2025',
    description: 'Le stade de Cambérène, enceinte du club depuis sa fondation.',
  },
];

const TeamGallery: React.FC = () => {
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('match');
  const [expanded, setExpanded] = useState(false);

  const { data: photos } = useGallery();
  const { data: matches } = useMatches();

  const visible = useMemo(() => photos.filter((photo) => photo.isVisible !== false), [photos]);

 
  const matchPhotos = useMemo(
    () => visible.filter((photo) => photo.category === 'match').sort(byMostRecent),
    [visible]
  );

 
  const grid = useMemo(
    () =>
      visible
        .filter((photo) => photo.category === activeTab)
        .sort(byMostRecent)
        .map(toImage),
    [visible, activeTab]
  );

 
  const albums = useMemo(() => {
    const groups = new Map<string, { label: string; date: string; photos: GalleryImage[] }>();

    matchPhotos.forEach((photo) => {
      const match = photo.match
        ? matches.find((entry) => String(entry.id) === String(photo.match))
        : undefined;
      const key = match ? String(match.id) : 'autres';
      const label = match
        ? match.venue === 'Domicile'
          ? `ASC Cambérène — ${match.opponent}`
          : `${match.opponent} — ASC Cambérène`
        : 'Autres photos de match';

      if (!groups.has(key)) groups.set(key, { label, date: match?.date ?? '', photos: [] });
      groups.get(key)!.photos.push(toImage(photo));
    });

    return [...groups.values()].sort((a, b) => b.date.localeCompare(a.date));
  }, [matchPhotos, matches]);

 
  const teaserMatch = useMemo(() => matchPhotos.slice(0, PREVIEW_COUNT), [matchPhotos]);
  const teaserGrid = useMemo(
    () => (expanded ? grid : grid.slice(0, PREVIEW_COUNT)),
    [grid, expanded]
  );
  const matchHasMore = matchPhotos.length > PREVIEW_COUNT;
  const gridHasMore = grid.length > PREVIEW_COUNT;

  const changeTab = (tab: TabId) => {
    setActiveTab(tab);
    setExpanded(false);
  };

  const toggleExpand = () => setExpanded((current) => !current);

 
  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selected]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const photoCard = (image: GalleryImage) => (
    <button
      key={image.id}
      type="button"
      onClick={() => setSelected(image)}
      className="group overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.04] text-left transition-colors hover:border-club-yellow/40"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          onError={handleImageError}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <ZoomIn size={32} className="text-club-yellow" />
        </div>
        {image.date && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-club-yellow">
            <Calendar size={12} />
            {image.date}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-extrabold uppercase text-white transition-colors group-hover:text-club-yellow">
          {image.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/60">{image.description}</p>
      </div>
    </button>
  );

  const toggleTile = () => (
    <button
      type="button"
      onClick={toggleExpand}
      className="flex aspect-square items-center justify-center rounded-[20px] border border-dashed border-white/20 bg-white/[0.02] text-white/60 transition-colors hover:border-club-yellow/40 hover:text-club-yellow"
    >
      <span className="flex flex-col items-center gap-1">
        {expanded ? <Minus size={28} /> : <Plus size={28} />}
        <span className="text-xs font-bold uppercase">
          {expanded ? 'Réduire' : 'Plus de photo'}
        </span>
      </span>
    </button>
  );

  return (
    <section className="band-charcoal py-12">
      <div className="site-container">
        <SectionHeader
          title="Galerie"
          linkLabel="Toute la galerie"
          linkTo="/galerie"
          className="mb-8"
        />

        {visible.length === 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FALLBACK.map(photoCard)}
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap gap-2">
              {GALLERY_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => changeTab(category)}
                  aria-pressed={activeTab === category}
                  className={`rounded-full px-5 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                    activeTab === category
                      ? 'bg-club-yellow text-black'
                      : 'bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {GALLERY_CATEGORY_LABELS[category]}
                </button>
              ))}
            </div>

            {activeTab === 'match' ? (
              !expanded ? (
                matchPhotos.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {teaserMatch.map(toImage).map(photoCard)}
                    {matchHasMore && toggleTile()}
                  </div>
                ) : (
                  <p className="panel p-8 text-center text-sm text-white/60">
                    Aucune photo de match pour le moment.
                  </p>
                )
              ) : albums.length > 0 ? (
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
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {album.photos.map(photoCard)}
                      </div>
                    </div>
                  ))}
                  <div className="grid max-w-xs grid-cols-1 gap-5">
                    {toggleTile()}
                  </div>
                </div>
              ) : (
                <p className="panel p-8 text-center text-sm text-white/60">
                  Aucune photo de match pour le moment.
                </p>
              )
            ) : grid.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {teaserGrid.map(photoCard)}
                {gridHasMore && toggleTile()}
              </div>
            ) : (
              <p className="panel p-8 text-center text-sm text-white/60">
                Aucune photo dans cette rubrique pour le moment.
              </p>
            )}
          </>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4">
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[20px] bg-graphite">
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Fermer"
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2.5 text-white transition-colors hover:text-club-yellow"
            >
              <X size={22} />
            </button>
            <div className="grid lg:grid-cols-2">
              <img src={selected.src} alt={selected.alt} className="h-64 w-full object-cover lg:h-full" />
              <div className="flex flex-col justify-center gap-4 p-8">
                <p className="flex items-center gap-2 text-sm font-bold uppercase text-club-yellow">
                  <Calendar size={16} />
                  {selected.date || 'ASC Cambérène'}
                </p>
                <h3 className="text-3xl font-extrabold uppercase text-white">{selected.title}</h3>
                <p className="leading-relaxed text-white/70">{selected.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TeamGallery;
