import { Injectable } from '@nestjs/common';
import type { Theme } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateAppearanceDto } from './dto/update-appearance.dto';

export interface AppearanceResponse {
  theme: string;
  accent: string;
  customAccent: string | null;
  corners: string;
  webLayout: string;
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
