import mongoose from 'mongoose';
import config from './env';

/**
 * Base locale ou base distante ?
 *
 * La distinction ne sert qu'à une chose : décider s'il faut forcer IPv4.
 */
const isLocalUri = (uri: string): boolean => /(localhost|127\.0\.0\.1|\[::1\])/i.test(uri);

/**
 * Ouverture de la connexion, seul chemin du serveur et de ses scripts.
 *
 * `family: 4` n'est appliqué qu'aux bases locales : il contourne la résolution
 * IPv6 de `localhost`, qui échoue quand mongod n'écoute qu'en IPv4 — le cas par
 * défaut sur macOS. Sur une base distante — MongoDB Atlas, par exemple — cette
 * contrainte n'a pas lieu d'être et empêcherait de joindre un nœud qui ne
 * publie qu'une adresse IPv6.
 *
 * `mongodb+srv://` d'Atlas demande une résolution DNS SRV avant la connexion :
 * elle échoue si le réseau bloque les requêtes DNS sortantes, ce que le message
 * d'erreur ne dit pas clairement.
 */
export const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(config.mongoUri, isLocalUri(config.mongoUri) ? { family: 4 } : {});
};

export const disconnectDatabase = (): Promise<void> => mongoose.connection.close();

/** URI sans identifiants, pour les journaux et les messages d'erreur. */
export const safeMongoUri = (uri: string = config.mongoUri): string =>
  uri.replace(/(mongodb(?:\+srv)?:\/\/)[^@]*@/, '$1***@');
