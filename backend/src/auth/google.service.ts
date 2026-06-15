import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

/**
 * Google OAuth 2.0 Authorization Code Flow (Login).
 * Secret bleibt serverseitig; Code→Token-Tausch passiert hier.
 */
@Injectable()
export class GoogleService {
  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(
      this.config.get<string>('GOOGLE_CLIENT_ID') &&
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
    );
  }

  private client(): OAuth2Client {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    // Redirect-URI muss in Produktion auf die FRONTEND-Domain zeigen, damit der
    // OAuth-Callback über den /api-Proxy läuft und die Auth-Cookies first-party
    // gesetzt werden (sonst Cross-Site → Mobile-Login bricht).
    // In Produktion daher IMMER aus FRONTEND_URL ableiten (eine evtl. veraltete
    // GOOGLE_LOGIN_REDIRECT_URI auf die Backend-Domain wird bewusst ignoriert).
    // Lokal: explizite GOOGLE_LOGIN_REDIRECT_URI verwenden (localhost-Backend).
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    const frontendUrl = this.config.get<string>('FRONTEND_URL');
    const derived = frontendUrl ? `${frontendUrl}/api/auth/google/callback` : undefined;
    const redirectUri =
      isProd && derived
        ? derived
        : (this.config.get<string>('GOOGLE_LOGIN_REDIRECT_URI') ?? derived);
    if (!clientId || !clientSecret || !redirectUri) {
      throw new InternalServerErrorException('Google-Login ist nicht konfiguriert (.env prüfen).');
    }
    return new OAuth2Client({ clientId, clientSecret, redirectUri });
  }

  /** Erzeugt die Google-Consent-URL inkl. state (CSRF-Schutz). */
  buildAuthUrl(state: string): string {
    return this.client().generateAuthUrl({
      access_type: 'online',
      scope: ['openid', 'email', 'profile'],
      state,
      prompt: 'select_account',
    });
  }

  /** Tauscht den Code gegen Tokens und verifiziert das ID-Token. */
  async verifyCode(code: string): Promise<GoogleProfile> {
    const client = this.client();
    let idToken: string | undefined;
    try {
      const { tokens } = await client.getToken(code);
      idToken = tokens.id_token ?? undefined;
    } catch {
      throw new UnauthorizedException('Google-Code konnte nicht eingelöst werden.');
    }
    if (!idToken) throw new UnauthorizedException('Kein ID-Token von Google erhalten.');

    const ticket = await client.verifyIdToken({
      idToken,
      audience: this.config.get<string>('GOOGLE_CLIENT_ID'),
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Google-Profil unvollständig.');
    }
    if (payload.email_verified === false) {
      throw new UnauthorizedException('Google-E-Mail ist nicht verifiziert.');
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email,
      avatarUrl: payload.picture,
    };
  }
}
