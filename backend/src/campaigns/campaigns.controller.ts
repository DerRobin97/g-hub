import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import type { CampaignDetailDto, CampaignSummaryDto, DiscountDto, MeasureDto } from '@g-hub/shared';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { CreateMeasureDto, UpdateMeasureDto } from './dto/measure.dto';
import { CreateDiscountDto, UpdateDiscountDto } from './dto/discount.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/jwt-payload.interface';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser): Promise<CampaignSummaryDto[]> {
    return this.campaigns.list(user.id);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<CampaignDetailDto> {
    return this.campaigns.get(user.id, id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCampaignDto,
  ): Promise<CampaignDetailDto> {
    return this.campaigns.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ): Promise<CampaignDetailDto> {
    return this.campaigns.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ status: string }> {
    return this.campaigns.remove(user.id, id);
  }

  @Post(':id/measures')
  createMeasure(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateMeasureDto,
  ): Promise<CampaignDetailDto> {
    return this.campaigns.createMeasure(user.id, id, dto);
  }
}

@Controller('measures')
@UseGuards(JwtAuthGuard)
export class MeasuresController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateMeasureDto,
  ): Promise<MeasureDto> {
    return this.campaigns.updateMeasure(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ status: string }> {
    return this.campaigns.removeMeasure(user.id, id);
  }

  @Post(':id/discounts')
  createDiscount(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateDiscountDto,
  ): Promise<MeasureDto> {
    return this.campaigns.createDiscount(user.id, id, dto);
  }
}

@Controller('discounts')
@UseGuards(JwtAuthGuard)
export class DiscountsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateDiscountDto,
  ): Promise<DiscountDto> {
    return this.campaigns.updateDiscount(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ status: string }> {
    return this.campaigns.removeDiscount(user.id, id);
  }
}
