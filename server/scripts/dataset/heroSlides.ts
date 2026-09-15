/**
 * Diapositives du carrousel de tête.
 *
 * La première chose qu'un visiteur voit. Le jeu d'amorçage en verse quatre,
 * qui montrent les trois formes possibles : une photo, une vidéo YouTube, et
 * une annonce sans visuel qui s'affiche sur le fond vert du club. Le club les
 * remplace ensuite depuis `/admin/carrousel` — c'est la matière sur laquelle
 * il apprend à s'en servir.
 *
 * Les photos sont celles livrées avec le site (`public/assets/`) plutôt que des
 * images de banque : le carrousel est la vitrine du club, et une photo générique
 * y serait plus visible qu'ailleurs.
 */
import { SeedHeroSlide } from './types';

export const seedHeroSlides: SeedHeroSlide[] = [
  {
    image: '/assets/img/asc-camberene-equipe-2025.webp',
    kicker: 'Résumé',
    title: "L'ASC Cambérène retrouve l'élite",
    link: '/news',
    linkLabel: "Lire l'actualité",
    rank: 0,
  },
  {
    youtube: 'https://youtu.be/Zh_5yh8rfNk',
    kicker: 'Résumé',
    title: "Présentation de notre recrue, l'enfant prodige du club",
    link: '/news',
    linkLabel: 'Voir le compte rendu',
    rank: 1,
  },
  {
    image: '/assets/img/coupe.jpg',
    kicker: 'Palmarès',
    title: 'Soixante ans de titres à Cambérène',
    link: '/histoire',
    linkLabel: "Découvrir l'histoire",
    rank: 2,
  },
  {
    kicker: 'Supporters',
    title: 'Prenez votre abonnement pour la saison',
    link: '/subscriptions',
    linkLabel: "S'abonner",
    rank: 3,
  },
];
