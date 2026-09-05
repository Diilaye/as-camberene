/**
 * Configuration du serveur, lue une fois et validée au démarrage.
 *
 * Un secret manquant doit arrêter le processus tout de suite : un serveur qui
 * démarre avec un JWT_SECRET vide signe des jetons que n'importe qui peut
 * forger, et personne ne s'en aperçoit avant l'incident.
 */

import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const required = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} est absent de l'environnement. Copier server/.env.example vers server/.env.`
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
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  upload: {
    dir: path.resolve(__dirname, '../..', process.env.UPLOAD_DIR ?? 'uploads'),
    maxBytes: Number(process.env.UPLOAD_MAX_BYTES ?? 5 * 1024 * 1024),
  },
};

export default config;
