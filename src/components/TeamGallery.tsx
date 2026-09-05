import React, { useEffect, useState } from 'react';
import { Calendar, X, ZoomIn } from 'lucide-react';
import SectionHeader from './ui/SectionHeader';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title: string;
  date: string;
  description: string;
}

const GALLERY: GalleryImage[] = [
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

  /** La visionneuse couvre l'écran : le défilement de la page est suspendu. */
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

  return (
    <section className="band-charcoal py-12">
      <div className="site-container">
        <SectionHeader title="Galerie" className="mb-8" />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {GALLERY.map((image) => (
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
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <ZoomIn size={32} className="text-club-yellow" />
                </div>
                <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-club-yellow">
                  <Calendar size={12} />
                  {image.date}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-extrabold uppercase text-white transition-colors group-hover:text-club-yellow">
                  {image.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-white/60">{image.description}</p>
              </div>
            </button>
          ))}
        </div>
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
                  {selected.date}
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
