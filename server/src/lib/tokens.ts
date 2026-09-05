/**
 * Jetons d'accès et de rafraîchissement.
 *
 * Les deux sont signés avec des secrets distincts, et le type est inscrit dans
 * la charge utile : un jeton de rafraîchissement présenté comme jeton d'accès
 * est refusé deux fois plutôt qu'une.
 *
 * La révocation n'est pas gérée : un jeton de rafraîchissement vole jusqu'à son
 * expiration, même après déconnexion. Pour une administration de club à
 * quelques comptes, la liste noire coûterait plus qu'elle ne rapporte — mais
 * c'est un choix à revoir si le nombre de comptes grandit.
 */

import jwt from 'jsonwebtoken';
import config from '../config/env';
import { unauthorized } from './http';
import { UserRole } from './roles';

export type { UserRole };

export interface TokenPayload {
  userId: string;
  role: UserRole;
}

interface SignedPayload extends TokenPayload {
  type: 'access' | 'refresh';
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

const sign = (payload: TokenPayload, type: SignedPayload['type']): string =>
  jwt.sign({ ...payload, type }, type === 'access' ? config.jwt.accessSecret : config.jwt.refreshSecret, {
    expiresIn: type === 'access' ? config.jwt.accessTtl : config.jwt.refreshTtl,
  } as jwt.SignOptions);

export const issueTokens = (payload: TokenPayload): TokenPair => {
  const access_token = sign(payload, 'access');
  const decoded = jwt.decode(access_token) as { exp: number };

  return {
    access_token,
    refresh_token: sign(payload, 'refresh'),
    expires_in: decoded.exp - Math.floor(Date.now() / 1000),
  };
};

export const verify = (token: string, type: SignedPayload['type']): TokenPayload => {
  try {
    const decoded = jwt.verify(
      token,
      type === 'access' ? config.jwt.accessSecret : config.jwt.refreshSecret
    ) as SignedPayload;

    if (decoded.type !== type) throw unauthorized('Jeton de type inattendu');

    return { userId: decoded.userId, role: decoded.role };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) throw unauthorized('Session expirée');
    throw unauthorized('Jeton invalide');
  }
};
