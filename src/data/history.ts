// Données de l'histoire du club (timeline linéaire)
// Chaque événement représente une grande étape structurante.
//
// Repli utilisé tant que le backend du site n'a pas repris la frise
// (server : npm run seed:content) ou qu'il est injoignable.
import { HistoryEvent } from '../types';

export const historyEvents: HistoryEvent[] = [
  {
    id: 'foundation',
    year: 1965,
    title: 'Fondation officielle du club',
    description:
      "Naissance d'une identité locale forte : un groupe de passionnés structure l'activité football autour des valeurs communautaires de Cambérène.",
    tags: ['Origines', 'Identité'],
    phase: 'Fondation',
  },
  {
    id: 'first-kit',
    year: 1968,
    title: 'Premiers jeux de maillots structurés',
    description:
      "Uniformisation des couleurs (dominantes jaune & vert) qui deviennent progressivement les marqueurs visuels du club.",
    tags: ['Couleurs', 'Identité visuelle'],
    phase: 'Fondation',
  },
  {
    id: 'youth-structure',
    year: 1974,
    dateLabel: '1974-1976',
    title: 'Structuration des premières catégories jeunes',
    description:
      "Lancement des sections U (préfiguration de l'académie) pour canaliser et former les talents locaux de manière durable.",
    tags: ['Formation', 'Jeunes'],
    phase: 'Expansion',
  },
  {
    id: 'first-trophy',
    year: 1982,
    title: 'Première distinction régionale',
    description:
      "Victoire symbolique qui crédibilise le modèle de progression interne et renforce l'engagement des bénévoles.",
    tags: ['Trophée', 'Reconnaissance'],
    phase: 'Consolidation',
  },
  {
    id: 'infrastructure',
    year: 1991,
    title: 'Amélioration des infrastructures locales',
    description:
      "Optimisation des terrains d'entraînement et structuration logistique permettant d'accueillir davantage de jeunes.",
    tags: ['Infrastructures', 'Croissance'],
    phase: 'Consolidation',
  },
  {
    id: 'generation-golden',
    year: 2003,
    title: 'Émergence d’une génération dorée',
    description:
      "Plusieurs jeunes formés au club commencent à rayonner dans les compétitions régionales, créant un effet d'entraînement sur la formation.",
    tags: ['Génération', 'Formation'],
    phase: 'Transition',
  },
  {
    id: 'digital-shift',
    year: 2015,
    title: 'Premiers efforts de présence numérique',
    description:
      "Mise en place des premiers canaux de communication digitaux pour valoriser l’activité sportive et l’identité locale.",
    tags: ['Numérique', 'Communication'],
    phase: 'Modernisation',
  },
  {
    id: 'academy-struct',
    year: 2019,
    title: 'Formalisation de la filière académique',
    description:
      "Clarification des parcours de progression (U12 → U19 → Senior) avec des principes méthodologiques unifiés.",
    tags: ['Académie', 'Structure'],
    phase: 'Modernisation',
  },
  {
    id: 'data-era',
    year: 2023,
    title: 'Introduction d’un pilotage orienté données',
    description:
      "Suivi basique des effectifs, matches et trajectoires individuelles amorçant une approche analytique.",
    tags: ['Données', 'Innovation'],
    phase: 'Nouvelle ère',
  },
  {
    id: 'platform-launch',
    year: 2025,
    title: 'Lancement de la plateforme digitale unifiée',
    description:
      "Centralisation publique: équipes, légendes, boutique, abonnements — renforçant l’identité et l’engagement communautaire.",
    tags: ['Plateforme', 'Ouverture', 'Engagement'],
    phase: 'Nouvelle ère',
  },
];

export const getHistoryEvents = (): HistoryEvent[] =>
  [...historyEvents].sort((a, b) => a.year - b.year);
