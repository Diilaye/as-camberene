/**
 * Configuration du serveur, lue une fois et validée au démarrage.
 *
 * Un secret manquant doit arrêter le processus tout de suite : un serveur qui
 * démarre avec un JWT_SECRET vide signe des jetons que n'importe qui peut
 * forger, et personne ne s'en aperçoit avant l'incident.
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/**
 * `dotenv` lit le `.env` du répertoire courant et se tait s'il n'y en a pas —
 * c'est voulu : en conteneur, la configuration vient de l'environnement et
 * aucun fichier n'est attendu. Mais quand une variable manque ensuite, savoir
 * quel fichier a été cherché, et s'il existe, évite de chercher au mauvais
 * endroit : le `.env` du serveur n'est pas celui de la racine du dépôt, et un
 * script lancé depuis un autre répertoire ne voit pas le même.
 */
const envPath = path.resolve(process.cwd(), '.env');
const envFileFound = fs.existsSync(envPath);

dotenv.config();

const required = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} est absent de l'environnement.\n`
      + (envFileFound
        ? `  ${envPath} a été lu, mais ne définit pas ${name}.`
        : `  Aucun fichier ${envPath}.\n`
          + '  Le créer à partir de server/.env.example, ou lancer la commande'
          + ' depuis le dossier server/ —\n'
          + '  sous Docker, la configuration vient de l\'environnement du'
          + ' conteneur : y exécuter la commande.')
    );
  }
  return value;
};

const isProduction = process.env.NODE_ENV === 'production';

const secret = (name: string): string => {
  const value = required(name);
  // En production, la valeur d'exemple laissée en place est une porte ouverte.
  if (isProduction && value.startsWith('changez')) {
    throw new Error(`${name} a gardé sa valeur d'exemple : la changer avant de déployer.`);
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT ?? 4100),
  isProduction,
  /**
   * Nombre de reverse proxys devant le serveur.
   *
   * Sans cette valeur, Express voit l'adresse du proxy et non celle du
   * visiteur : la limite de débit s'appliquerait alors à tout le monde
   * ensemble, et le premier robot venu la ferait porter aux vrais visiteurs.
   *
   * C'est un nombre et non `true` : `true` fait confiance à l'en-tête
   * `X-Forwarded-For` entier, que n'importe quel client peut fabriquer. Le
   * nombre dit combien de maillons, en partant du serveur, sont les nôtres.
   *
   *   0  exposition directe (développement)
   *   1  un Apache en frontal
   *   2  Apache de l'hôte + Apache du conteneur (déploiement Docker)
   */
  trustProxy: Number(process.env.TRUST_PROXY ?? 0),
  mongoUri: required('MONGODB_URI'),
  jwt: {
    accessSecret: secret('JWT_ACCESS_SECRET'),
    refreshSecret: secret('JWT_REFRESH_SECRET'),
    accessTtl: process.env.JWT_ACCESS_TTL ?? '2h',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',
  },
  /**
   * Adresse publique du site, utilisée par les pages d'aperçu de partage.
   *
   * Les réseaux chargent l'image depuis leurs propres serveurs : un chemin
   * relatif n'y veut rien dire, et il faut donc pouvoir composer une adresse
   * absolue. À défaut de réglage, la première origine autorisée fait l'affaire
   * — c'est le domaine du site dans tous les déploiements du projet.
   */
  siteUrl: (process.env.SITE_URL ?? process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')[0]
    .trim()
    .replace(/\/+$/, ''),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  upload: {
    dir: path.resolve(__dirname, '../..', process.env.UPLOAD_DIR ?? 'uploads'),
    maxBytes: Number(process.env.UPLOAD_MAX_BYTES ?? 5 * 1024 * 1024),
  },
  /**
   * Passerelle PayTech, pour les dons.
   *
   * Facultative, contrairement aux secrets des jetons : sans clés, le site
   * démarre et la page des dons annonce qu'ils ne sont pas encore ouverts. Un
   * serveur qui refuserait de démarrer faute de passerelle priverait tout le
   * site pour une seule page.
   *
   * `env` vaut `test` tant que le compte marchand n'est pas activé : PayTech
   * simule alors le paiement, et rien n'est débité.
   */
  paytech: {
    apiKey: process.env.PAYTECH_API_KEY?.trim() ?? '',
    apiSecret: process.env.PAYTECH_API_SECRET?.trim() ?? '',
    env: process.env.PAYTECH_ENV?.trim() === 'prod' ? ('prod' as const) : ('test' as const),
  },
};

export default config;
