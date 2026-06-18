import { IsEmail, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

/**
 * Teil-Aktualisierung des Profils (Name/E-Mail/Telefon).
 * Alle Felder optional → es werden nur die übermittelten Werte gespeichert.
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  // Telefonnummer. null/leer löscht sie.
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(40)
  phone?: string | null;
}
