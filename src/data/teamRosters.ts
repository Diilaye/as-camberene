// Effectifs des équipes – structure centralisée
// Chaque roster suit les mêmes clés pour simplifier l'affichage dynamique.

export interface PlayerEntry {
  name: string;
  number?: number; // absent pour staff
  age?: number;
  nationality?: string;
  role?: string; // pour staff
  experience?: string; // staff
  photo: string;
  contact?: { email: string; phone: string };
}

export interface TeamRosters {
  goalkeepers: PlayerEntry[];
  defenders: PlayerEntry[];
  midfielders: PlayerEntry[];
  forwards: PlayerEntry[];
  staff: PlayerEntry[];
}

/**
 * Portrait de remplacement.
 *
 * Le club ne publie pas encore de photos individuelles : une silhouette aux
 * couleurs de l'ASC Cambérène tient la place, servie en ligne pour éviter une
 * requête réseau par joueur.
 */
const placeholderPhoto =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23202126'/%3E%3Ccircle cx='150' cy='150' r='58' fill='%230D7C27'/%3E%3Cpath d='M150 228c-62 0-112 44-112 98v74h224v-74c0-54-50-98-112-98z' fill='%230D7C27'/%3E%3C/svg%3E";

export const rosters: Record<string, TeamRosters> = {
  'equipe-a': {
    goalkeepers: [
      { name: 'Mamadou Diallo', number: 1, age: 28, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Ibrahima Ndiaye', number: 23, age: 25, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    defenders: [
      { name: 'Ibrahima Sarr', number: 4, age: 25, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Ousmane Ba', number: 3, age: 24, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Cheikh Diop', number: 5, age: 27, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Alpha Konte', number: 2, age: 26, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Modou Fall', number: 15, age: 23, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    midfielders: [
      { name: 'Abdoulaye Ndiaye', number: 6, age: 27, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Cheikh Fall', number: 10, age: 26, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Pape Sow', number: 8, age: 25, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Daouda Ba', number: 14, age: 24, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Khadim Diallo', number: 16, age: 28, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    forwards: [
      { name: 'Moussa Sow', number: 7, age: 23, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Lamine Diop', number: 11, age: 22, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Papa Ndiaye', number: 9, age: 25, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Youssou Ndour', number: 19, age: 21, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    staff: [
      { name: 'Mamadou Diallo', role: 'ENTRAÎNEUR PRINCIPAL', experience: '8 ans', contact: { email: 'm.diallo@asccamberene.sn', phone: '+221 77 123 45 67' }, photo: placeholderPhoto },
      { name: 'Ibrahima Kane', role: 'ENTRAÎNEUR ADJOINT', experience: '5 ans', contact: { email: 'i.kane@asccamberene.sn', phone: '+221 77 234 56 78' }, photo: placeholderPhoto },
      { name: 'Dr. Fatou Seck', role: 'MÉDECIN DU SPORT', experience: '12 ans', contact: { email: 'f.seck@asccamberene.sn', phone: '+221 77 345 67 89' }, photo: placeholderPhoto },
      { name: 'Omar Thiam', role: 'PRÉPARATEUR PHYSIQUE', experience: '6 ans', contact: { email: 'o.thiam@asccamberene.sn', phone: '+221 77 456 78 90' }, photo: placeholderPhoto }
    ]
  },
  'equipe-u19': {
    goalkeepers: [
      { name: 'Babacar Diop', number: 1, age: 16, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Amadou Tall', number: 30, age: 17, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    defenders: [
      { name: 'Saliou Niang', number: 2, age: 17, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Modou Fall', number: 4, age: 16, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Ibou Dieng', number: 5, age: 17, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Alassane Kane', number: 3, age: 16, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    midfielders: [
      { name: 'Pape Sow', number: 6, age: 17, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Daouda Ba', number: 10, age: 16, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Omar Diallo', number: 8, age: 17, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Moussa Gueye', number: 14, age: 16, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    forwards: [
      { name: 'Khadim Diallo', number: 7, age: 17, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Youssou Ndour', number: 9, age: 16, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Assane Diop', number: 11, age: 17, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    staff: [
      { name: 'Ousmane Ba', role: 'ENTRAÎNEUR PRINCIPAL', experience: '4 ans', contact: { email: 'o.ba@asccamberene.sn', phone: '+221 77 567 89 01' }, photo: placeholderPhoto },
      { name: 'Seydou Dieng', role: 'ENTRAÎNEUR ADJOINT', experience: '3 ans', contact: { email: 's.dieng@asccamberene.sn', phone: '+221 77 678 90 12' }, photo: placeholderPhoto },
      { name: 'Aminata Wade', role: 'PRÉPARATRICE PHYSIQUE', experience: '2 ans', contact: { email: 'a.wade@asccamberene.sn', phone: '+221 77 789 01 23' }, photo: placeholderPhoto }
    ]
  },
  'equipe-u17': {
    goalkeepers: [
      { name: 'Babacar Diop', number: 1, age: 16, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Amadou Tall', number: 30, age: 17, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    defenders: [
      { name: 'Saliou Niang', number: 2, age: 17, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Modou Fall', number: 4, age: 16, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Ibou Dieng', number: 5, age: 17, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Alassane Kane', number: 3, age: 16, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    midfielders: [
      { name: 'Pape Sow', number: 6, age: 17, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Daouda Ba', number: 10, age: 16, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Omar Diallo', number: 8, age: 17, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Moussa Gueye', number: 14, age: 16, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    forwards: [
      { name: 'Khadim Diallo', number: 7, age: 17, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Youssou Ndour', number: 9, age: 16, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Assane Diop', number: 11, age: 17, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    staff: [
      { name: 'Ousmane Ba', role: 'ENTRAÎNEUR PRINCIPAL', experience: '4 ans', contact: { email: 'o.ba@asccamberene.sn', phone: '+221 77 567 89 01' }, photo: placeholderPhoto },
      { name: 'Seydou Dieng', role: 'ENTRAÎNEUR ADJOINT', experience: '3 ans', contact: { email: 's.dieng@asccamberene.sn', phone: '+221 77 678 90 12' }, photo: placeholderPhoto },
      { name: 'Aminata Wade', role: 'PRÉPARATRICE PHYSIQUE', experience: '2 ans', contact: { email: 'a.wade@asccamberene.sn', phone: '+221 77 789 01 23' }, photo: placeholderPhoto }
    ]
  },
  'equipe-u15': {
    goalkeepers: [
      { name: 'Cheikh Diop', number: 1, age: 14, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Mamadou Ly', number: 25, age: 15, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    defenders: [
      { name: 'Ibou Sarr', number: 2, age: 15, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Alpha Diallo', number: 4, age: 14, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Moussa Ndiaye', number: 5, age: 15, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Pape Fall', number: 3, age: 14, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    midfielders: [
      { name: 'Lamine Ba', number: 6, age: 15, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Serigne Dieng', number: 10, age: 14, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Abdou Kane', number: 8, age: 15, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Bocar Sow', number: 14, age: 13, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    forwards: [
      { name: 'Seydou Niang', number: 7, age: 15, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Aliou Diop', number: 9, age: 14, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Fallou Gueye', number: 11, age: 15, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    staff: [
      { name: 'Abdoulaye Ndiaye', role: 'ENTRAÎNEUR PRINCIPAL', experience: '3 ans', contact: { email: 'a.ndiaye@asccamberene.sn', phone: '+221 77 890 12 34' }, photo: placeholderPhoto },
      { name: 'Papa Cissé', role: 'ENTRAÎNEUR ADJOINT', experience: '2 ans', contact: { email: 'p.cisse@asccamberene.sn', phone: '+221 77 901 23 45' }, photo: placeholderPhoto }
    ]
  },
  'equipe-u12': {
    goalkeepers: [
      { name: 'Mamadou Diagne', number: 1, age: 12, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Omar Sy', number: 20, age: 11, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    defenders: [
      { name: 'Fallou Diaw', number: 2, age: 12, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Sekou Ba', number: 4, age: 11, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Issa Ndiaye', number: 5, age: 12, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    midfielders: [
      { name: 'Modou Diop', number: 6, age: 12, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Cheikh Sall', number: 10, age: 11, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Papa Thiam', number: 8, age: 12, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    forwards: [
      { name: 'Abdou Kone', number: 7, age: 12, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Bouba Fall', number: 9, age: 11, nationality: '🇸🇳', photo: placeholderPhoto },
      { name: 'Lamine Sarr', number: 11, age: 10, nationality: '🇸🇳', photo: placeholderPhoto }
    ],
    staff: [
      { name: 'Fatou Seck', role: 'ENTRAÎNEUSE PRINCIPALE', experience: '5 ans', contact: { email: 'f.seck@asccamberene.sn', phone: '+221 77 012 34 56' }, photo: placeholderPhoto },
      { name: 'Alioune Diouf', role: 'ASSISTANT TECHNIQUE', experience: '3 ans', contact: { email: 'a.diouf@asccamberene.sn', phone: '+221 77 123 45 67' }, photo: placeholderPhoto }
    ]
  }
};

export const getRosterForTeam = (teamId: string): TeamRosters | undefined => rosters[teamId];
