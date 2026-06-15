import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import type { AssetDto, UploadUrlDto } from '@g-hub/shared';
import { AssetsService } from './assets.service';
import { RequestUploadUrlDto } from './dto/request-upload-url.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { QueryAssetsDto } from './dto/query-assets.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/jwt-payload.interface';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  @Post('upload-url')
  uploadUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RequestUploadUrlDto,
  ): Promise<UploadUrlDto> {
    return this.assets.requestUploadUrl(user.id, dto);
  }

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryAssetsDto,
  ): Promise<AssetDto[]> {
    return this.assets.list(user.id, query);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<AssetDto> {
    return this.assets.get(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAssetDto): Promise<AssetDto> {
    return this.assets.create(user.id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ status: string }> {
    return this.assets.remove(user.id, id);
  }
}
