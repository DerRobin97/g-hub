import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, type Theme } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateAppearanceDto } from './dto/update-appearance.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';

export interface AppearanceResponse {
  theme: string;
  accent: string;
  customAccent: string | null;
  corners: string;
  webLayout: string;
}

export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
}

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  /** Liest die Darstellungs-Einstellungen; legt Defaults an, falls noch keine existieren. */
  async getAppearance(userId: string): Promise<AppearanceResponse> {
    const pref = await this.prisma.appearancePref.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    return this.toResponse(pref);
  }

  /** Speichert die übermittelten Felder (Upsert, damit fehlende Prefs nachgelegt werden). */
  async updateAppearance(userId: string, dto: UpdateAppearanceDto): Promise<AppearanceResponse> {
    const data = {
      ...(dto.theme !== undefined ? { theme: dto.theme as Theme } : {}),
      ...(dto.accent !== undefined ? { accent: dto.accent } : {}),
      ...(dto.customAccent !== undefined ? { customAccent: dto.customAccent } : {}),
      ...(dto.corners !== undefined ? { corners: dto.corners } : {}),
      ...(dto.webLayout !== undefined ? { webLayout: dto.webLayout } : {}),
    };

    const pref = await this.prisma.appearancePref.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    return this.toResponse(pref);
  }

  /** Aktualisiert Name/E-Mail/Telefon; nur übermittelte Felder werden geschrieben. */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileResponse> {
    const data = {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.email !== undefined ? { email: dto.email.toLowerCase().trim() } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone?.trim() || null } : {}),
    };

    try {
      const user = await this.prisma.user.update({ where: { id: userId }, data });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('E-Mail ist bereits vergeben.');
      }
      throw err;
    }
  }

  private toResponse(pref: {
    theme: string;
    accent: string;
    customAccent: string | null;
    corners: string;
    webLayout: string;
  }): AppearanceResponse {
    return {
      theme: pref.theme,
      accent: pref.accent,
      customAccent: pref.customAccent,
      corners: pref.corners,
      webLayout: pref.webLayout,
    };
  }
}
