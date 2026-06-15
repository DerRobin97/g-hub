import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AuthModule, StorageModule], // JwtAuthGuard + StorageService
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
