import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type { SearchResultsDto } from '@g-hub/shared';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/jwt-payload.interface';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get()
  query(
    @CurrentUser() user: AuthenticatedUser,
    @Query('q') q = '',
  ): Promise<SearchResultsDto> {
    return this.search.search(user.id, q);
  }
}
