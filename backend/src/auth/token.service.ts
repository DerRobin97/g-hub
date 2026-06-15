import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';
import type { JwtPayload } from '../common/jwt-payload.interface';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

/**
 * Stellt Access-/Refresh-JWTs aus und legt sie als httpOnly-Cookies ab.
 * Getrennte Secrets/TTLs (Bauplan §3 Backend: JWT Access + Refresh).
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private accessTtl(): number {
    return Number(this.config.get<string>('JWT_ACCESS_TTL') ?? 900);
  }

  private refreshTtl(): number {
    return Number(this.config.get<string>('JWT_REFRESH_TTL') ?? 2592000);
  }

  private cookieBase(): CookieOptions {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    // Produktion: Frontend und Backend liegen auf getrennten Domains (Railway),
    // also Cross-Site → SameSite=None + Secure, sonst sendet der Browser die
    // Cookies nicht mit. Lokal (gleiche Origin via Vite-Proxy): Lax genügt.
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    };
  }

  async signAccess(payload: JwtPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.accessTtl(),
    });
  }

  async signRefresh(payload: JwtPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.refreshTtl(),
    });
  }

  async verifyRefresh(token: string): Promise<JwtPayload> {
    return this.jwt.verifyAsync<JwtPayload>(token, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async issueToResponse(res: Response, payload: JwtPayload): Promise<void> {
    const [access, refresh] = await Promise.all([
      this.signAccess(payload),
      this.signRefresh(payload),
    ]);
    const base = this.cookieBase();
    res.cookie(ACCESS_COOKIE, access, { ...base, maxAge: this.accessTtl() * 1000 });
    res.cookie(REFRESH_COOKIE, refresh, { ...base, maxAge: this.refreshTtl() * 1000 });
  }

  clearCookies(res: Response): void {
    const base = this.cookieBase();
    res.clearCookie(ACCESS_COOKIE, base);
    res.clearCookie(REFRESH_COOKIE, base);
  }
}
