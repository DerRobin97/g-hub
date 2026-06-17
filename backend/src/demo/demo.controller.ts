import { Controller, Post, UseGuards } from '@nestjs/common';
import { DemoService } from './demo.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/jwt-payload.interface';

@Controller('demo')
@UseGuards(JwtAuthGuard)
export class DemoController {
  constructor(private readonly demo: DemoService) {}

  @Post('seed')
  seed(@CurrentUser() user: AuthenticatedUser): Promise<{ status: string }> {
    return this.demo.seed(user.id);
  }

  @Post('clear')
  clear(@CurrentUser() user: AuthenticatedUser): Promise<{ status: string }> {
    return this.demo.clear(user.id);
  }
}
