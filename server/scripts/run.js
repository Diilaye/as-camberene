/**
 * Lanceur des scripts d'administration.
 *
 * Ces scripts sont écrits en TypeScript, que Node n'exécute pas. En
 * développement `tsx` s'en charge — mais `tsx` est une dépendance de
 * développement, et une installation de production (`npm ci --omit=dev`, ou
 * un simple `NODE_ENV=production` qui pousse npm à les omettre) ne l'a pas.
 * On découvrait alors `tsx: not found` au pire moment : sur le serveur neuf,
 * au moment de créer le tout premier compte, quand l'administration est
 * justement inaccessible faute de ce compte.
 *
 * Ce fichier est donc en JavaScript ordinaire, sans aucune dépendance : quoi
 * qu'il arrive, Node sait le lire. Il choisit ensuite ce qui est disponible,
 * la version compilée par `npm run build` ou les sources via `tsx`, et le dit
 * clairement quand il ne trouve ni l'une ni l'autre.
 *
 *   node scripts/run.js bootstrap-admins --superadmin direction@ascamberene.sn
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const [name, ...args] = process.argv.slice(2);

if (!name) {
  console.error('Usage : node scripts/run.js <script> [options]');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const compiled = path.join(root, 'dist-scripts', 'scripts', `${name}.js`);
const source = path.join(root, 'scripts', `${name}.ts`);
// `.cmd` sous Windows ; ailleurs le lien sans extension.
const tsx = [path.join(root, 'node_modules', '.bin', 'tsx'), path.join(root, 'node_modules', '.bin', 'tsx.cmd')].find(
  (candidate) => fs.existsSync(candidate)
);

if (!fs.existsSync(source) && !fs.existsSync(compiled)) {
  console.error(`Script inconnu : ${name}`);
  process.exit(1);
}

/**
 * Les sources d'abord, quand `tsx` est là.
 *
 * En développement, c'est le fichier qu'on vient de modifier qui doit tourner,
 * pas une version compilée la veille. En production `tsx` est absent et c'est
 * le compilé qui prend le relais — sans que la commande à taper change.
 */
const [command, commandArgs] =
  tsx && fs.existsSync(source)
    ? [tsx, [source, ...args]]
    : fs.existsSync(compiled)
      ? [process.execPath, [compiled, ...args]]
      : [null, null];

if (!command) {
  console.error(
    `Rien à exécuter pour « ${name} » : ni version compilée, ni tsx pour lire les sources.\n\n`
    + 'Deux façons d\'en sortir, depuis server/ :\n'
    + '  npm run build              construit les scripts (recommandé en production)\n'
    + '  npm install --include=dev  réinstalle tsx et les outils de développement'
  );
  process.exit(1);
}

const result = spawnSync(command, commandArgs, { stdio: 'inherit', cwd: root });

if (result.error) {
  console.error('Échec du lancement :', result.error.message);
  process.exit(1);
}

// Un script tué par un signal ne rend pas de code : on n'en fabrique pas un
// faux succès.
process.exit(result.status === null ? 1 : result.status);
