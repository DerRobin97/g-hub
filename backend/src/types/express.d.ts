import type { AuthenticatedUser } from '../common/jwt-payload.interface';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
