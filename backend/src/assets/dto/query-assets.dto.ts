import { IsIn, IsOptional } from 'class-validator';
import { ASSET_KINDS, type AssetKind } from '@g-hub/shared';

/** Optionaler Filter für die Asset-Liste (nach Art). */
export class QueryAssetsDto {
  @IsOptional()
  @IsIn([...ASSET_KINDS])
  kind?: AssetKind;
}
