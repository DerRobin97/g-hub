import { Controller, Get } from '@nestjs/common';
import { APP_VERSION } from '@g-hub/shared';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<{ status: string; version: string; db: string; time: string }> {
    let db = 'down';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = 'up';
    } catch {
      db = 'down';
    }
    return {
      status: 'ok',
      version: APP_VERSION,
      db,
      time: new Date().toISOString(),
    };
  }
}
