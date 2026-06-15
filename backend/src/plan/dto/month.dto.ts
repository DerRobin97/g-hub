import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePlanMonthDto {
  // Leitmotiv des Monats; leer/null setzt es zurück.
  @IsOptional()
  @IsString()
  @MaxLength(120)
  focus?: string;
}
