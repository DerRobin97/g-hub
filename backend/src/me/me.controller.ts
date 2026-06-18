import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { MeService, type AppearanceResponse, type ProfileResponse } from './me.service';
import { UpdateAppearanceDto } from './dto/update-appearance.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/jwt-payload.interface';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly me: MeService) {}

  @Get('appearance')
  getAppearance(@CurrentUser() user: AuthenticatedUser): Promise<AppearanceResponse> {
    return this.me.getAppearance(user.id);
  }

  @Put('appearance')
  updateAppearance(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAppearanceDto,
  ): Promise<AppearanceResponse> {
    return this.me.updateAppearance(user.id, dto);
  }

  @Put('profile')
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponse> {
    return this.me.updateProfile(user.id, dto);
  }
}
