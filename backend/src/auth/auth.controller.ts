import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { AuthService, type MeResponse } from './auth.service';
import { GoogleService } from './google.service';
import { TokenService, REFRESH_COOKIE } from './token.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser, JwtPayload } from '../common/jwt-payload.interface';

const STATE_COOKIE = 'g_oauth_state';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly google: GoogleService,
    private readonly tokens: TokenService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MeResponse> {
    const user = await this.auth.register(dto);
    await this.tokens.issueToResponse(res, { sub: user.id, email: user.email });
    return this.auth.getMe(user.id);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MeResponse> {
    const user = await this.auth.validateCredentials(dto.email, dto.password);
    await this.tokens.issueToResponse(res, { sub: user.id, email: user.email });
    return this.auth.getMe(user.id);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ status: string }> {
    const token = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
    if (!token) throw new UnauthorizedException('Kein Refresh-Token.');
    let payload: JwtPayload;
    try {
      payload = await this.tokens.verifyRefresh(token);
    } catch {
      throw new UnauthorizedException('Refresh-Token ungültig oder abgelaufen.');
    }
    await this.tokens.issueToResponse(res, { sub: payload.sub, email: payload.email });
    return { status: 'ok' };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response): { status: string } {
    this.tokens.clearCookies(res);
    return { status: 'ok' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthenticatedUser): Promise<MeResponse> {
    return this.auth.getMe(user.id);
  }

  // ── Google-Login (OAuth Code-Flow) ───────────────────────────

  @Get('google/connect')
  connectGoogle(@Res() res: Response): void {
    if (!this.google.isConfigured()) {
      throw new BadRequestException('Google-Login ist nicht konfiguriert.');
    }
    const state = randomBytes(16).toString('hex');
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    res.cookie(STATE_COOKIE, state, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60 * 1000,
    });
    res.redirect(this.google.buildAuthUrl(state));
  }

  @Get('google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const query = req.query as Record<string, string | undefined>;
    const code = query.code;
    const state = query.state;
    const cookieState = (req.cookies as Record<string, string> | undefined)?.[STATE_COOKIE];

    // CSRF: state aus Cookie muss zum zurückgegebenen state passen.
    if (!code || !state || !cookieState || state !== cookieState) {
      res.redirect(`${frontendUrl}/login?error=google_state`);
      return;
    }
    res.clearCookie(STATE_COOKIE, { path: '/' });

    try {
      const profile = await this.google.verifyCode(code);
      const user = await this.auth.findOrCreateGoogleUser(profile);
      await this.tokens.issueToResponse(res, { sub: user.id, email: user.email });
      res.redirect(`${frontendUrl}/`);
    } catch {
      res.redirect(`${frontendUrl}/login?error=google_failed`);
    }
  }
}
