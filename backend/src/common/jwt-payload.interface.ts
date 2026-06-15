export interface JwtPayload {
  sub: string; // User-ID
  email: string;
}

export type TokenType = 'access' | 'refresh';

// Auf dem Request hinterlegter, authentifizierter Nutzer (vom JwtAuthGuard).
export interface AuthenticatedUser {
  id: string;
  email: string;
}
