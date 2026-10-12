
import { HeroSlide } from '../types';

export type { HeroSlide };

export const heroSlides: HeroSlide[] = [
  {
    id: 'repli-equipe',
    image: '/assets/img/asc-camberene-equipe-2025.webp',
    kicker: 'Résumé',
    title: "L'ASC Cambérène retrouve l'élite",
    link: '/news',
    linkLabel: "Lire l'actualité",
  },
  {
    id: 'repli-recrue',
    youtube: 'https://youtu.be/Zh_5yh8rfNk',
    kicker: 'Résumé',
    title: "Presentation de notre recrue leader l'enfant prodige du club",
    link: '/news',
    linkLabel: 'Voir le compte rendu',
  },
  {
    id: 'repli-palmares',
    image: '/assets/img/coupe.jpg',
    kicker: 'Palmarès',
    title: 'Soixante ans de titres à Cambérène',
    link: '/histoire',
    linkLabel: "Découvrir l'histoire",
  },
  {
    id: 'repli-abonnement',
    kicker: 'Supporters',
    title: 'Prenez votre abonnement pour la saison',
    link: '/subscriptions',
    linkLabel: "S'abonner",
  },
];


export const partners: { name: string; logo: string; href?: string }[] = [];
