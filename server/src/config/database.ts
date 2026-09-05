import mongoose from 'mongoose';
import config from './env';

export const connectDatabase = async (): Promise<void> => {
  // `family: 4` évite la résolution IPv6 de `localhost`, qui échoue quand
  // mongod n'écoute qu'en IPv4 — le cas par défaut sur macOS.
  await mongoose.connect(config.mongoUri, { family: 4 });
};

export const disconnectDatabase = (): Promise<void> => mongoose.connection.close();
