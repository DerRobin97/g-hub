import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { RegisterDto } from './dto/register.dto';

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  memberships: Array<{
    workspaceId: string;
    workspaceName: string;
    workspaceSlug: string;
    role: string;
  }>;
  appearance: {
    theme: string;
    accent: string;
    customAccent: string | null;
    corners: string;
    webLayout: string;
  } | null;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /** Registriert einen Nutzer und legt seinen ersten Workspace (Owner) an. */
  async register(dto: RegisterDto): Promise<User> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('E-Mail ist bereits registriert.');

    const passwordHash = await argon2.hash(dto.password);
    const slug = await this.uniqueSlug(dto.workspaceName);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: dto.name.trim(), email, passwordHash },
      });
      const workspace = await tx.workspace.create({
        data: { name: dto.workspaceName.trim(), slug },
      });
      await tx.membership.create({
        data: { userId: user.id, workspaceId: workspace.id, role: 'owner' },
      });
      await tx.appearancePref.create({ data: { userId: user.id } });
      return user;
    });
  }

  /** Prüft E-Mail/Passwort und liefert den Nutzer oder wirft 401. */
  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('E-Mail oder Passwort falsch.');
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) throw new UnauthorizedException('E-Mail oder Passwort falsch.');
    return user;
  }

  /**
   * Findet oder erstellt einen Nutzer anhand des Google-Profils.
   * Neue Google-Nutzer erhalten direkt einen eigenen Workspace.
   */
  async findOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<User> {
    const email = profile.email.toLowerCase().trim();

    const byGoogle = await this.prisma.user.findUnique({ where: { googleId: profile.googleId } });
    if (byGoogle) return byGoogle;

    // E-Mail existiert bereits (z. B. Passwort-Konto) → Google-ID verknüpfen.
    const byEmail = await this.prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      return this.prisma.user.update({
        where: { id: byEmail.id },
        data: { googleId: profile.googleId, avatarUrl: byEmail.avatarUrl ?? profile.avatarUrl },
      });
    }

    const slug = await this.uniqueSlug(`${profile.name}s Workspace`);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: profile.name.trim() || email,
          email,
          googleId: profile.googleId,
          avatarUrl: profile.avatarUrl,
        },
      });
      const workspace = await tx.workspace.create({
        data: { name: `${profile.name}s Workspace`.trim(), slug },
      });
      await tx.membership.create({
        data: { userId: user.id, workspaceId: workspace.id, role: 'owner' },
      });
      await tx.appearancePref.create({ data: { userId: user.id } });
      return user;
    });
  }

  /** Lädt die /me-Repräsentation inkl. Memberships + Appearance. */
  async getMe(userId: string): Promise<MeResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: { include: { workspace: true } },
        appearance: true,
      },
    });
    if (!user) throw new UnauthorizedException('Nutzer nicht gefunden.');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      memberships: user.memberships.map((m) => ({
        workspaceId: m.workspaceId,
        workspaceName: m.workspace.name,
        workspaceSlug: m.workspace.slug,
        role: m.role,
      })),
      appearance: user.appearance
        ? {
            theme: user.appearance.theme,
            accent: user.appearance.accent,
            customAccent: user.appearance.customAccent,
            corners: user.appearance.corners,
            webLayout: user.appearance.webLayout,
          }
        : null,
    };
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base =
      name
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 40) || 'workspace';
    let slug = base;
    for (let i = 0; i < 100; i++) {
      const taken = await this.prisma.workspace.findUnique({ where: { slug } });
      if (!taken) return slug;
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }
    return `${base}-${Date.now().toString(36)}`;
  }
}
