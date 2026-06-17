import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // stellt JwtAuthGuard bereit
  controllers: [DemoController],
  providers: [DemoService],
})
export class DemoModule {}
