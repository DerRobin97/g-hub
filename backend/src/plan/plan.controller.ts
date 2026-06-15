import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { PlanLinkDto, PlanMonthDto, PlanThemeDto } from '@g-hub/shared';
import { PlanService } from './plan.service';
import { CreatePlanThemeDto, UpdatePlanThemeDto } from './dto/theme.dto';
import { CreatePlanLinkDto, UpdatePlanLinkDto } from './dto/link.dto';
import { UpdatePlanMonthDto } from './dto/month.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/jwt-payload.interface';

@Controller('plan')
@UseGuards(JwtAuthGuard)
export class PlanController {
  constructor(private readonly plan: PlanService) {}

  @Get(':year')
  listYear(
    @CurrentUser() user: AuthenticatedUser,
    @Param('year', ParseIntPipe) year: number,
  ): Promise<PlanMonthDto[]> {
    return this.plan.listYear(user.id, year);
  }

  @Post(':year/seed')
  seed(
    @CurrentUser() user: AuthenticatedUser,
    @Param('year', ParseIntPipe) year: number,
  ): Promise<PlanMonthDto[]> {
    return this.plan.seedYear(user.id, year);
  }

  @Patch(':year/months/:month')
  updateMonth(
    @CurrentUser() user: AuthenticatedUser,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Body() dto: UpdatePlanMonthDto,
  ): Promise<PlanMonthDto> {
    return this.plan.updateMonth(user.id, year, month, dto);
  }

  @Post(':year/months/:month/themes')
  createTheme(
    @CurrentUser() user: AuthenticatedUser,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Body() dto: CreatePlanThemeDto,
  ): Promise<PlanMonthDto> {
    return this.plan.createTheme(user.id, year, month, dto);
  }

  @Post(':year/months/:month/links')
  createLink(
    @CurrentUser() user: AuthenticatedUser,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Body() dto: CreatePlanLinkDto,
  ): Promise<PlanMonthDto> {
    return this.plan.createLink(user.id, year, month, dto);
  }
}

@Controller('plan-themes')
@UseGuards(JwtAuthGuard)
export class PlanThemesController {
  constructor(private readonly plan: PlanService) {}

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdatePlanThemeDto,
  ): Promise<PlanThemeDto> {
    return this.plan.updateTheme(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ status: string }> {
    return this.plan.removeTheme(user.id, id);
  }
}

@Controller('plan-links')
@UseGuards(JwtAuthGuard)
export class PlanLinksController {
  constructor(private readonly plan: PlanService) {}

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdatePlanLinkDto,
  ): Promise<PlanLinkDto> {
    return this.plan.updateLink(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ status: string }> {
    return this.plan.removeLink(user.id, id);
  }
}
