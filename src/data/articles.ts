import { Article } from '../types';

export const articles: Article[] = [
  {
    id: 1,
    title: "ASC Cambérène Champion de Ligue 2 : Retour en Élite !",
    content: "L'Association Sportive Cambérène a décroché le titre de champion de Ligue 2 en juin 2025, s'offrant ainsi une promotion historique en Ligue 1 sénégalaise. Fondé en 1965 par le Khalife général des Layènes, Seydina El Hadji Abdoulaye Thiaw Laye, le club retrouve l'élite du football sénégalais pour la première fois sous l'ère professionnelle. Cette promotion couronne des années d'efforts et de détermination. Pour cette saison 2025-2026 en Ligue 1, l'objectif sera clairement le maintien dans l'élite.",
    excerpt: "Après 60 ans d'existence, l'ASC décroche enfin sa promotion en Ligue 1 professionnelle.",
    image: "assets/img/coupe.jpg",
    category: "Club",
    publishedAt: "2025-07-10",
    author: "Mamadou Diallo - Sport Sénégal",
  status: 'published',
    comments: [
      { id: 1, author: "SupporterASC", content: "Enfin ! 60 ans d'attente, ça valait le coup !", timestamp: "2025-07-10T10:30:00Z" },
      { id: 2, author: "CambereneForever", content: "Direction la Ligue 1 ! Fiers d'être de Cambérène !", timestamp: "2025-07-10T11:15:00Z" }
    ]
  },
  {
    id: 2,
    title: "Nouveau maillot domicile saison 2025-26",
    content: "Découvrez le nouveau maillot domicile d'ASC Camberene pour la saison 2025-26. Aux couleurs traditionnelles jaune et bleu, ce maillot rend hommage à nos racines avec des motifs inspirés de l'art sénégalais. Conçu avec des technologies modernes pour optimiser les performances de nos joueurs.",
    excerpt: "Un design authentique qui célèbre notre héritage sénégalais.",
    image: "assets/img/asc-camberene-equipe-2025.webp",
    category: "Club",
    publishedAt: "2025-07-08",
    author: "Direction Commerciale",
  status: 'published',
    comments: [
      { id: 3, author: "MaillotCollector", content: "Magnifique ! Les couleurs sont superbes.", timestamp: "2025-07-08T14:20:00Z" }
    ]
  },
  {
    id: 3,
    title: "Retour sur la finale de 2009 : Un rêve brisé mais un exploit historique",
    content: "En décembre 2009, l'ASC Cambérène atteignait la finale de la Coupe du Sénégal face à l'ASC Jaraaf. Bien que battus 1-0, nos Lions ont marqué l'histoire en devenant le premier club de division inférieure à atteindre la finale depuis des décennies. Malgré la controverse sur la préparation (une seule semaine accordée), cette finale reste un moment de fierté pour Cambérène. Cette performance avait d'ailleurs permis au club de participer à la Coupe de l'UFOA.",
    excerpt: "Il y a 16 ans, Cambérène écrivait l'une des plus belles pages de son histoire.",
    image: "assets/img/coupe.jpg",
    category: "Club",
    publishedAt: "2025-07-05",
    author: "Archives ASC Cambérène",
  status: 'published',
    comments: [
      { id: 4, author: "Veteran2009", content: "J'y étais ! Quelle ambiance dans les tribunes !", timestamp: "2025-07-05T16:45:00Z" },
      { id: 5, author: "HistoireASC", content: "Cette finale nous a montré qu'on pouvait rivaliser avec les grands", timestamp: "2025-07-05T17:20:00Z" }
    ]
  },
  {
    id: 4,
    title: "Stage de préparation à Saly",
    content: "L'équipe première d'ASC Camberene effectue un stage de préparation intensif à Saly Portudal. Au programme : entraînements biquotidiens, cohésion d'équipe et préparation tactique pour les prochaines échéances du championnat. L'entraîneur Pape Sow se dit confiant pour la suite de la saison.",
    excerpt: "Préparation intensive à Saly avant la reprise du championnat.",
    image: "assets/img/asc-camberene-equipe-2025.webp",
    category: "Équipe",
    publishedAt: "2025-07-02",
    author: "Staff Technique",
  status: 'published',
    comments: []
  },
  {
    id: 5,
    title: "Nouveau centre de formation à Camberene",
    content: "ASC Camberene a inauguré son nouveau centre de formation pour les jeunes talents. Ce projet ambitieux vise à développer les futurs talents du football sénégalais. Équipé de terrains synthétiques et d'infrastructures modernes, ce centre accueillera 150 jeunes de 12 à 18 ans.",
    excerpt: "Un centre de formation moderne pour les jeunes talents sénégalais.",
    image: "assets/img/asc-camberene-equipe-2025.webp",
    category: "Club",
    publishedAt: "2025-06-30",
    author: "Direction",
  status: 'published',
    comments: [
      { id: 5, author: "FootballJeunes", content: "Excellente initiative pour l'avenir du football sénégalais !", timestamp: "2025-06-30T09:30:00Z" }
    ]
  },
  {
    id: 6,
    title: "Match amical contre l'équipe nationale U23",
    content: "ASC Camberene affrontera l'équipe nationale U23 du Sénégal en match amical le 25 juillet. Ce sera l'occasion pour nos jeunes talents de se mesurer aux futurs Lions du Sénégal. Le match se déroulera au stade Léopold Sédar Senghor à 17h00.",
    excerpt: "Match de prestige contre les Lions U23 du Sénégal.",
    image: "assets/img/coupe.jpg",
    category: "Matchs",
    publishedAt: "2025-07-12",
    author: "Service Communication",
    status: 'published',
    comments: []
  }
];