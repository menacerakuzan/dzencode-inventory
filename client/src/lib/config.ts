/** Client configuration from environment variables, with defaults for local development. */

/** Name of the httpOnly cookie holding the JWT (must match the API's AUTH_COOKIE_NAME). */
export const AUTH_COOKIE = process.env.AUTH_COOKIE_NAME ?? 'token';

/** Socket.io server; empty — same origin (behind nginx). */
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || undefined;

export const MAP_TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const MAP_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
