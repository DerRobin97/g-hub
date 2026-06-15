import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { CAMPAIGN_STATUS, MEASURE_TYPES, type CampaignStatus, type MeasureType } from '@g-hub/shared';

export class CreateMeasureDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsIn([...MEASURE_TYPES])
  type?: MeasureType;

  @IsOptional()
  @IsIn([...CAMPAIGN_STATUS])
  status?: CampaignStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  progress?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  postsCount?: number;
}

export class UpdateMeasureDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsIn([...MEASURE_TYPES])
  type?: MeasureType;

  @IsOptional()
  @IsIn([...CAMPAIGN_STATUS])
  status?: CampaignStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  progress?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  postsCount?: number;
}
