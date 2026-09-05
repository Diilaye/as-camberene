/**
 * Diapositives du carrousel de tête.
 *
 * Une diapositive porte soit une photo (`image`), soit une vidéo YouTube
 * (`youtube`) — jamais les deux : `youtube` l'emporte, et `image` sert alors
 * d'affiche le temps que le lecteur se charge.
 *
 * `youtube` accepte ce que l'on a sous la main : un identifiant nu, un lien de
 * la barre d'adresse, un lien de partage `youtu.be`, un lien `/embed/` ou
 * `/shorts/`. Voir `src/lib/youtube.ts`.
 *
 * Pour ajouter une vidéo, il suffit d'une entrée de plus dans ce tableau :
 *
 *   {
 *     youtube: 'https://www.youtube.com/watch?v=XXXXXXXXXXX',
 *     kicker: 'Résumé',
 *     title: 'ASC Cambérène — Jaraaf : les buts',
 *     link: '/news',
 *     linkLabel: 'Voir le compte rendu',
 *   }
 */
export interface HeroSlide {
  /** Photo de fond. Ignorée si `youtube` est renseigné et que la vidéo charge. */
  image?: string;
  /** Identifiant ou lien YouTube. La diapositive devient alors une vidéo. */
  youtube?: string;
  /** Surtitre jaune, en capitales. */
  kicker: string;
  /** Titre blanc, en capitales, sur trois lignes au plus. */
  title: string;
  link: string;
  linkLabel: string;
}

export const heroSlides: HeroSlide[] = [
  {
    image: '/assets/img/asc-camberene-equipe-2025.webp',
    kicker: 'Résumé',
    title: "L'ASC Cambérène retrouve l'élite",
    link: '/news',
    linkLabel: "Lire l'actualité",
  },
  {
    youtube: 'https://youtu.be/Zh_5yh8rfNk',
    kicker: 'Résumé',
    title: "Presentation de notre recrue leader l'enfant prodige du club",
    link: '/news',
    linkLabel: 'Voir le compte rendu',
  },
  {
    image: '/assets/img/coupe.jpg',
    kicker: 'Palmarès',
    title: 'Soixante ans de titres à Cambérène',
    link: '/histoire',
    linkLabel: "Découvrir l'histoire",
  },
  {
    kicker: 'Supporters',
    title: 'Prenez votre abonnement pour la saison',
    link: '/subscriptions',
    linkLabel: "S'abonner",
  },
];

/**
 * Partenaires affichés sous le carrousel et dans le bandeau haut.
 *
 * Le club n'en publie pas encore : la rangée reste vide, et les deux emplacements
 * se replient d'eux-mêmes. Ajouter une entrée `{ name, logo, href }` suffit à
 * les faire apparaître.
 */
export const partners: { name: string; logo: string; href?: string }[] = [];
