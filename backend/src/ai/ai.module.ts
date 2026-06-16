import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // stellt JwtAuthGuard bereit
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
