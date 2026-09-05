import { Player } from '../types';

export const players: Player[] = [
  {
    id: 1,
    name: "Mamadou Diallo",
    number: 10,
    position: "Milieu offensif",
    nationality: "Sénégal",
    age: 26,
    photo: "assets/img/coupe.jpg",
    stats: { matches: 22, goals: 8, assists: 12 },
    biography: "Capitaine et meneur de jeu d'ASC Camberene, Mamadou orchestré le jeu avec une vision exceptionnelle.",
    joinedYear: 2022
  },
  {
    id: 2,
    name: "Ousmane Ba",
    number: 9,
    position: "Attaquant",
    nationality: "Sénégal",
    age: 24,
    photo: "assets/img/asc-camberene-equipe-2025.webp",
    stats: { matches: 20, goals: 15, assists: 4 },
    biography: "Buteur prolifique et rapide, Ousmane est la pointe d'attaque redoutable des Jaune et Bleu.",
    joinedYear: 2023
  },
  {
    id: 3,
    name: "Abdou Khadre Ndiaye",
    number: 1,
    position: "Gardien",
    nationality: "Sénégal",
    age: 28,
    photo: "assets/img/coupe.jpg",
    stats: { matches: 24, goals: 0, assists: 0 },
    biography: "Gardien titulaire fiable, Abdou Khadre est le dernier rempart de l'équipe.",
    joinedYear: 2021
  },
  {
    id: 4,
    name: "Ibrahima Ndiaye",
    number: 6,
    position: "Milieu défensif",
    nationality: "Sénégal",
    age: 22,
    photo: "assets/img/asc-camberene-equipe-2025.webp",
    stats: { matches: 18, goals: 2, assists: 6 },
    biography: "Milieu défensif technique et travailleur, Ibrahima apporte son énergie au centre du jeu.",
    joinedYear: 2025
  },
  {
    id: 5,
    name: "Moussa Ndiaye",
    number: 5,
    position: "Défenseur central",
    nationality: "Sénégal",
    age: 25,
    photo: "assets/img/asc-camberene-equipe-2025.webp",
    stats: { matches: 23, goals: 3, assists: 2 },
    biography: "Défenseur central solide et aérien, Moussa forme une charnière fiable.",
    joinedYear: 2022
  },
  {
    id: 6,
    name: "Amadou Ciss",
    number: 7,
    position: "Ailier gauche", 
    nationality: "Sénégal",
    age: 21,
    photo: "assets/img/coupe.jpg",
    stats: { matches: 19, goals: 6, assists: 8 },
    biography: "Jeune ailier prometteur, Amadou impressionne par sa vitesse et sa technique.",
    joinedYear: 2024
  }
];