import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import type { User } from '../types.js';
import { HttpError } from './errors.js';

interface TokenPayload {
  sub: string;
  email: string;
  name: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

export const signToken = (user: User): string =>
  jwt.sign({ email: user.email, name: user.name } satisfies Omit<TokenPayload, 'sub'>, config.jwt.secret, {
    subject: String(user.id),
    expiresIn: config.jwt.ttlSeconds,
  });

export function verifyToken(token: string): User {
  const payload = jwt.verify(token, config.jwt.secret) as TokenPayload;
  return { id: Number(payload.sub), email: payload.email, name: payload.name };
}

const extractToken = (authorization: string | undefined, cookieToken: unknown): string | null => {
  if (authorization?.startsWith('Bearer ')) return authorization.slice('Bearer '.length);
  return typeof cookieToken === 'string' && cookieToken ? cookieToken : null;
};

/** Accepts the JWT from the httpOnly cookie (browser) or from `Authorization: Bearer` (API clients). */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = extractToken(req.headers.authorization, req.cookies?.[config.cookie.name]);
  if (!token) return next(new HttpError(401, 'Authentication required'));
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired token'));
  }
};
