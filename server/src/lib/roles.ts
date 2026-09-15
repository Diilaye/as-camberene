/**
 * Rôles et permissions du site.
 *
 * Un rôle ne dit pas ce qu'un compte a le droit de faire : il désigne une
 * liste de permissions, et ce sont elles que les routes exigent. L'intérêt est
 * de pouvoir déplacer un droit d'un rôle à l'autre sans toucher à une seule
 * route — et de lire, à un seul endroit, qui peut quoi.
 *
 * Ce fichier a un jumeau côté site (`src/lib/roles.ts`) qui sert à masquer les
 * écrans hors de portée. Le jumeau ne protège rien : il n'évite qu'un aller-
 * retour pour se voir refuser. L'autorité est ici, sur le serveur, à chaque
 * requête.
 */

export const ROLES = ['superadmin', 'admin', 'journalist', 'shop-admin', 'subscriber'] as const;
export type UserRole = (typeof ROLES)[number];

export const PERMISSIONS = [
  /** Créer, modifier, désactiver et supprimer les comptes. */
  'users:manage',
  'articles:write',
  'products:write',
  /** Lire les commandes et les faire avancer. */
  'orders:manage',
  'legends:write',
  'history:write',
  /** Tenir l'effectif : joueurs et encadrement de chaque équipe. */
  'players:write',
  /** Le carrousel de tête de l'accueil : photos, vidéos et leur ordre. */
  'hero:write',
  /** Le calendrier : rencontres à venir, scores des rencontres jouées. */
  'matches:write',
  'comments:moderate',
  'media:upload',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const EDITORIAL: Permission[] = [
  'articles:write',
  'legends:write',
  'history:write',
  'comments:moderate',
  'media:upload',
];

/**
 * Qui peut quoi.
 *
 * `superadmin` est le seul à administrer les comptes : c'est ce qui distingue
 * la direction du club de ceux à qui elle délègue une rubrique. `admin` tient
 * tout le contenu sans pouvoir se donner de collègues, `journalist` la partie
 * éditoriale, `shop-admin` la boutique — son catalogue et ses commandes.
 */
const MATRIX: Record<UserRole, Permission[]> = {
  superadmin: [...PERMISSIONS],
  admin: [
    ...EDITORIAL,
    'products:write',
    'orders:manage',
    'players:write',
    'hero:write',
    'matches:write',
  ],
  journalist: [...EDITORIAL],
  'shop-admin': ['products:write', 'orders:manage', 'media:upload'],
  subscriber: [],
};

/** Libellés affichés dans l'administration et dans les messages d'erreur. */
export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super administrateur',
  admin: 'Administrateur',
  journalist: 'Journaliste',
  'shop-admin': 'Responsable boutique',
  subscriber: 'Supporter',
};

/**
 * Rôles qu'un super administrateur peut attribuer.
 *
 * `superadmin` en fait partie : la direction doit pouvoir se donner un
 * suppléant sans passer par le serveur. Les garde-fous qui empêchent de se
 * rétrograder soi-même ou de supprimer le dernier vivent dans la route.
 */
export const ASSIGNABLE_ROLES: UserRole[] = [
  'superadmin',
  'admin',
  'journalist',
  'shop-admin',
  'subscriber',
];

export const permissionsOf = (role: UserRole): Permission[] => MATRIX[role] ?? [];

export const roleCan = (role: UserRole, permission: Permission): boolean =>
  permissionsOf(role).includes(permission);

/**
 * Le compte accède-t-il à l'administration ?
 *
 * Un supporter n'y a rien à faire ; tous les autres y entrent, chacun sur les
 * écrans que ses permissions ouvrent.
 */
export const isStaffRole = (role: UserRole): boolean => role !== 'subscriber';
