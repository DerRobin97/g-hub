import { IsIn, IsInt, IsISO8601, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { DISCOUNT_TYPES, type DiscountType } from '@g-hub/shared';

export class CreateDiscountDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsIn([...DISCOUNT_TYPES])
  type?: DiscountType;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  value?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  code?: string;

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
  @IsInt()
  @Min(0)
  redeemed?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  limit?: number;
}

export class UpdateDiscountDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsIn([...DISCOUNT_TYPES])
  type?: DiscountType;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  value?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  code?: string;

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
  @IsInt()
  @Min(0)
  redeemed?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  limit?: number;
}
