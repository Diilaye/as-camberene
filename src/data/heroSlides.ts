/**
 * Diapositives de repli du carrousel de tête.
 *
 * Le carrousel se tient désormais depuis l'administration
 * (`/admin/carrousel`) : ses diapositives vivent en base, et le club y change
 * photos, vidéos et ordre sans toucher au code. Ce tableau reste ce que le
 * site affiche quand l'API ne répond pas — un accueil daté plutôt qu'un écran
 * noir — et ce qu'il montre tant qu'aucune diapositive n'a été saisie.
 *
 * Une diapositive porte soit une photo (`image`), soit une vidéo YouTube
 * (`youtube`) — jamais les deux à l'écran : `youtube` l'emporte, et `image`
 * sert alors d'affiche le temps que le lecteur se charge.
 *
 * `youtube` accepte ce que l'on a sous la main : un identifiant nu, un lien de
 * la barre d'adresse, un lien de partage `youtu.be`, un lien `/embed/` ou
 * `/shorts/`. Voir `src/lib/youtube.ts`.
 *
 * Les identifiants sont des chaînes fixes : ces entrées ne viennent d'aucune
 * base, mais le carrousel a besoin d'une clé stable pour chaque diapositive.
 */
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

/**
 * Partenaires affichés sous le carrousel et dans le bandeau haut.
 *
 * Le club n'en publie pas encore : la rangée reste vide, et les deux emplacements
 * se replient d'eux-mêmes. Ajouter une entrée `{ name, logo, href }` suffit à
 * les faire apparaître.
 */
export const partners: { name: string; logo: string; href?: string }[] = [];
