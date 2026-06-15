import {
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CAMPAIGN_STATUS, CHANNELS, type CampaignStatus } from '@g-hub/shared';

export class CreateCampaignDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsIn([...CAMPAIGN_STATUS])
  status?: CampaignStatus;

  @IsOptional()
  @IsArray()
  @IsIn([...CHANNELS], { each: true })
  channels?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  spent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  reach?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  kpiText?: string;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  zeitraum?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  dueLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  color?: string;
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsIn([...CAMPAIGN_STATUS])
  status?: CampaignStatus;

  @IsOptional()
  @IsArray()
  @IsIn([...CHANNELS], { each: true })
  channels?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  spent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  reach?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  kpiText?: string;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  zeitraum?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  dueLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  color?: string;
}
