import React, { useMemo, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { useGallery } from '../hooks/useContent';
import { GALLERY_CATEGORIES, GALLERY_CATEGORY_LABELS, GalleryItem } from '../types';
import { handleImageError } from '../lib/imagePlaceholder';
import PageHero from '../components/ui/PageHero';
import galleryHero from '../../assets/img/asc-camberene-equipe-2025.webp';

type Tab = (typeof GALLERY_CATEGORIES)[number];

const TABS: { id: Tab; label: string }[] = GALLERY_CATEGORIES.map((category) => ({
  id: category as Tab,
  label: GALLERY_CATEGORY_LABELS[category],
}));

const formatDate = (value?: string): string =>
  value
    ? new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';


const Gallery: React.FC = () => {
  const [tab, setTab] = useState<Tab>('match');
  const [zoomed, setZoomed] = useState<GalleryItem | null>(null);

  const { data: photos, loading } = useGallery();

  const visible = useMemo(
    () => photos.filter((photo) => photo.category === tab),
    [photos, tab]
  );

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
        className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-graphite/95 to-transparent p-4">
        <p className="font-extrabold uppercase text-white">{photo.title}</p>
        {photo.date && <p className="text-[11px] text-white/60">{formatDate(photo.date)}</p>}
      </div>
    </button>
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
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="panel p-8 text-center text-sm text-white/60">Chargement des photos…</p>
        ) : visible.length === 0 ? (
          <p className="panel p-8 text-center text-sm text-white/60">
            Aucune photo dans cette rubrique pour le moment.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{visible.map(photoCard)}</div>
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
