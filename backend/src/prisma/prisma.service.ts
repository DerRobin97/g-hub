import { Injectable, Logger, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Mit Datenbank verbunden.');
    } catch (err) {
      // Nicht-fatal: App startet trotzdem, /api/health meldet db:down.
      // Verbindung wird bei der nächsten Query erneut versucht.
      this.logger.warn(
        `Datenbank beim Start nicht erreichbar (${(err as Error).message}). ` +
          'Starte Postgres via "docker compose up -d".',
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
