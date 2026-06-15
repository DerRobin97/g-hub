import { IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PLAN_CATEGORIES, PLAN_CHANNELS, type PlanCategory } from '@g-hub/shared';

export class CreatePlanThemeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  description?: string;

  @IsOptional()
  @IsIn([...PLAN_CATEGORIES])
  category?: PlanCategory;

  @IsOptional()
  @IsArray()
  @IsIn([...PLAN_CHANNELS], { each: true })
  channels?: string[];
}

export class UpdatePlanThemeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  description?: string;

  @IsOptional()
  @IsIn([...PLAN_CATEGORIES])
  category?: PlanCategory;

  @IsOptional()
  @IsArray()
  @IsIn([...PLAN_CHANNELS], { each: true })
  channels?: string[];
}
