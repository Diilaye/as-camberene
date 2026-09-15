/**
 * Amorçage de l'administration du site : le super administrateur et
 * l'administrateur, en une commande.
 *
 * Un site fraîchement déployé n'a aucun compte, et `/api/users` — la route par
 * laquelle tous les autres se créent — est réservée au super administrateur.
 * Il faut donc un premier compte ouvert depuis le serveur, et ce script ouvre
 * dans la foulée celui qui tiendra le contenu au quotidien : la direction ne
 * se sert de son compte que pour distribuer les rôles.
 *
 * Qui peut quoi se lit dans `src/lib/roles.ts` :
 *   superadmin  tout, y compris les comptes  → direction du club
 *   admin       tout le contenu, aucun compte → rédaction, boutique, effectif
 *
 *   npm run bootstrap:admins
 *   npm run bootstrap:admins -- --superadmin direction@ascamberene.sn \
 *                               --admin redaction@ascamberene.sn
 *
 * Sans argument et dans un terminal, le script demande les deux adresses. En
 * CI ou dans un conteneur — pas de terminal — il faut les passer en options,
 * sinon il s'arrête plutôt que de deviner.
 *
 * Il est rejouable : un compte déjà là est laissé tel quel, son mot de passe
 * intact. `--reset-passwords` en tire de nouveaux — c'est le chemin de
 * récupération quand plus personne ne peut se connecter.
 *
 *   npm run bootstrap:admins -- --superadmin direction@ascamberene.sn --reset-passwords
 *
 * Les mots de passe ne sont affichés qu'une fois : ils ne sont stockés que
 * hachés, et rien ne permet de les relire ensuite.
 */
import readline from 'readline';

import { connectDatabase, disconnectDatabase, safeMongoUri } from '../src/config/database';
import { ROLE_LABELS, UserRole } from '../src/lib/roles';
import {
  EnsureAccountResult,
  MIN_PASSWORD_LENGTH,
  ensureAccount,
  looksLikeEmail,
} from './lib/accounts';

const DEFAULT_DOMAIN = 'ascamberene.sn';

function readOption(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  return value && !value.startsWith('--') ? value : undefined;
}

const hasFlag = (name: string): boolean => process.argv.includes(`--${name}`);

/**
 * Question posée au terminal, avec une réponse par défaut.
 *
 * `process.stdin.isTTY` distingue la personne du script : un `npm run` lancé
 * depuis un Dockerfile n'a personne pour répondre, et attendre indéfiniment y
 * ressemble à un déploiement figé.
 */
async function ask(question: string, fallback: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await new Promise<string>((resolve) =>
      rl.question(`${question} [${fallback}] `, resolve)
    );
    return answer.trim() || fallback;
  } finally {
    rl.close();
  }
}

/** Ce que le script doit ouvrir : une adresse et un mot de passe par rôle. */
interface Target {
  role: UserRole;
  email: string;
  password?: string;
}

async function collectTargets(): Promise<Target[] | null> {
  const interactive = Boolean(process.stdin.isTTY) && !hasFlag('yes');

  let superadmin = readOption('superadmin');
  let admin = readOption('admin');

  if (!superadmin && interactive) {
    superadmin = await ask('Email du super administrateur ?', `direction@${DEFAULT_DOMAIN}`);
  }
  if (!admin && interactive) {
    admin = await ask("Email de l'administrateur ?", `admin@${DEFAULT_DOMAIN}`);
  }

  if (!superadmin) {
    console.error(
      'Aucune adresse fournie et aucun terminal pour la demander.\n'
      + 'Usage : npm run bootstrap:admins -- --superadmin <email> [--admin <email>]'
    );
    return null;
  }

  const targets: Target[] = [
    { role: 'superadmin', email: superadmin, password: readOption('superadmin-password') },
  ];

  // L'administrateur est facultatif : la direction peut vouloir n'ouvrir que
  // son propre compte et créer le reste depuis /admin/utilisateurs.
  if (admin) {
    targets.push({ role: 'admin', email: admin, password: readOption('admin-password') });
  }

  const invalid = targets.filter((target) => !looksLikeEmail(target.email.trim().toLowerCase()));
  if (invalid.length > 0) {
    console.error(`Email invalide : ${invalid.map((target) => target.email).join(', ')}`);
    return null;
  }

  // Deux rôles sur une même adresse : le second écraserait le premier sans que
  // rien ne le signale, et la direction perdrait ses droits sur les comptes.
  const emails = targets.map((target) => target.email.trim().toLowerCase());
  if (new Set(emails).size !== emails.length) {
    console.error(
      'Le super administrateur et l\'administrateur doivent avoir deux adresses distinctes.'
    );
    return null;
  }

  const tooShort = targets.find(
    (target) => target.password && target.password.length < MIN_PASSWORD_LENGTH
  );
  if (tooShort) {
    console.error(
      `Le mot de passe de ${tooShort.email} doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`
    );
    return null;
  }

  return targets;
}

function report(result: EnsureAccountResult): void {
  const label = ROLE_LABELS[result.role];

  if (result.outcome === 'unchanged') {
    console.log(`○ ${result.email} — ${label}, déjà en place. Mot de passe inchangé.`);
    return;
  }

  const verb = result.outcome === 'created' ? 'Compte créé' : 'Compte mis à jour';
  console.log(`✓ ${result.email} — ${label}. ${verb}.`);
  console.log(`    nom          : ${result.name}`);
  if (result.changes.length > 0) {
    console.log(`    changements  : ${result.changes.join(', ')}`);
  }
  if (result.password) {
    console.log(`    mot de passe : ${result.password}`);
  }
}

async function main(): Promise<number> {
  const targets = await collectTargets();
  if (!targets) return 1;

  const resetPassword = hasFlag('reset-passwords');

  console.log(`Base : ${safeMongoUri()}\n`);
  await connectDatabase();

  try {
    const results: EnsureAccountResult[] = [];
    for (const target of targets) {
      results.push(
        await ensureAccount({
          email: target.email,
          role: target.role,
          password: target.password,
          resetPassword: resetPassword || Boolean(target.password),
        })
      );
    }

    results.forEach(report);

    const withPassword = results.filter((result) => result.password);
    if (withPassword.length > 0) {
      console.log(
        "\nCes mots de passe ne seront plus affichés : ils ne sont stockés que hachés."
      );
      console.log('Les noter, puis les faire changer à la première connexion.');
    }

    const skipped = results.filter((result) => result.outcome === 'unchanged');
    if (skipped.length > 0 && !resetPassword) {
      console.log(
        '\nUn compte déjà en place garde son mot de passe. Relancer avec'
        + ' --reset-passwords pour en tirer de nouveaux.'
      );
    }

    console.log('\nConnexion sur /login, puis administration sur /admin.');
    console.log('Les autres comptes se créent ensuite depuis /admin/utilisateurs.');
    return 0;
  } finally {
    await disconnectDatabase();
  }
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error('Échec :', error instanceof Error ? error.message : error);
    process.exit(1);
  });
