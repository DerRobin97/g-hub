import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PLAN_LINK_DIRECTIONS, type PlanLinkDirection } from '@g-hub/shared';

export class CreatePlanLinkDto {
  @IsIn([...PLAN_LINK_DIRECTIONS])
  direction!: PlanLinkDirection;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  targetMonth!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  text!: string;
}

export class UpdatePlanLinkDto {
  @IsOptional()
  @IsIn([...PLAN_LINK_DIRECTIONS])
  direction?: PlanLinkDirection;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  targetMonth?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  text?: string;
}
