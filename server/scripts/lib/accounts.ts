/**
 * Ouverture de comptes depuis le serveur, partagée par les scripts.
 *
 * Tout ce qui touche au mot de passe et à la promotion vit ici plutôt que dans
 * chaque script : deux chemins d'amorçage qui divergeraient sur la longueur
 * minimale ou sur ce qu'ils écrasent d'un compte existant finiraient par se
 * contredire, et c'est précisément le genre de détail qu'on ne relit qu'après
 * l'incident.
 */
import crypto from 'crypto';

import SiteUser from '../../src/models/SiteUser.model';
import { ROLE_LABELS, UserRole } from '../../src/lib/roles';

/** Même minimum que `validators/users.ts` : un compte de secours n'est pas une exception. */
export const MIN_PASSWORD_LENGTH = 10;

/**
 * Mot de passe aléatoire lisible : trois groupes séparés, sans caractères
 * ambigus (ni `O`/`0`, ni `l`/`1`). Il sera dicté ou recopié à la main au
 * moins une fois — autant qu'il survive au trajet.
 */
export function generatePassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const pick = (n: number) =>
    Array.from(crypto.randomBytes(n))
      .map((byte) => alphabet[byte % alphabet.length])
      .join('');
  return `${pick(4)}-${pick(4)}-${pick(4)}!`;
}

/** Contrôle sommaire : le modèle exige un email unique, pas un email plausible. */
export const looksLikeEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

export type AccountOutcome = 'created' | 'updated' | 'unchanged';

export interface EnsureAccountInput {
  email: string;
  role: UserRole;
  name?: string;
  /** Imposé par l'appelant ; à défaut, tiré au sort à la création. */
  password?: string;
  /**
   * Sur un compte qui existe déjà, réattribue le mot de passe.
   *
   * Sans ce drapeau, un compte existant garde le sien : relancer l'amorçage
   * pour ajouter un second administrateur ne doit pas, au passage, déconnecter
   * le premier.
   */
  resetPassword?: boolean;
}

export interface EnsureAccountResult {
  outcome: AccountOutcome;
  email: string;
  name: string;
  role: UserRole;
  previousRole?: UserRole;
  /** Rendu une seule fois, et seulement s'il vient d'être fixé. */
  password?: string;
  /** Ce qui a changé sur un compte existant, pour le récapitulatif. */
  changes: string[];
}

/**
 * Crée le compte s'il manque, l'ajuste s'il existe — jamais deux fois le même.
 *
 * L'opération est rejouable : c'est ce qui permet de relancer l'amorçage sur
 * une base déjà peuplée sans se demander ce qu'on va casser.
 */
export async function ensureAccount(input: EnsureAccountInput): Promise<EnsureAccountResult> {
  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() || ROLE_LABELS[input.role];

  if (!looksLikeEmail(email)) {
    throw new Error(`Email invalide : ${input.email}`);
  }
  if (input.password && input.password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `Le mot de passe de ${email} doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`
    );
  }

  const existing = await SiteUser.findOne({ email });

  if (!existing) {
    const password = input.password ?? generatePassword();
    const user = await SiteUser.create({
      name,
      email,
      password_hash: password, // haché par le hook du modèle
      role: input.role,
    });
    return {
      outcome: 'created',
      email: user.email,
      name: user.name,
      role: user.role,
      password,
      changes: [],
    };
  }

  const changes: string[] = [];
  const previousRole = existing.role;

  if (existing.role !== input.role) {
    existing.role = input.role;
    changes.push(`profil ${ROLE_LABELS[previousRole]} → ${ROLE_LABELS[input.role]}`);
  }
  if (!existing.is_active) {
    existing.is_active = true;
    changes.push('compte réactivé');
  }

  let password: string | undefined;
  if (input.resetPassword) {
    password = input.password ?? generatePassword();
    existing.password_hash = password; // haché par le hook du modèle
    changes.push('mot de passe réattribué');
  }

  if (changes.length === 0) {
    return {
      outcome: 'unchanged',
      email: existing.email,
      name: existing.name,
      role: existing.role,
      changes,
    };
  }

  await existing.save();
  return {
    outcome: 'updated',
    email: existing.email,
    name: existing.name,
    role: existing.role,
    previousRole,
    password,
    changes,
  };
}
