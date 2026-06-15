import { IsHexColor, IsIn, IsOptional, ValidateIf } from 'class-validator';
import {
  ACCENT_OPTIONS,
  CORNER_STYLES,
  THEMES,
  WEB_LAYOUTS,
  type AccentOption,
  type CornerStyle,
  type ThemeName,
  type WebLayout,
} from '@g-hub/shared';

/**
 * Teil-Aktualisierung der Darstellungs-Einstellungen (Bauplan §6.4).
 * Alle Felder optional → es werden nur die übermittelten Werte gespeichert.
 */
export class UpdateAppearanceDto {
  @IsOptional()
  @IsIn([...THEMES])
  theme?: ThemeName;

  @IsOptional()
  @IsIn([...ACCENT_OPTIONS])
  accent?: AccentOption;

  // Frei wählbare Akzentfarbe (#rrggbb). null setzt sie zurück.
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsHexColor()
  customAccent?: string | null;

  @IsOptional()
  @IsIn([...CORNER_STYLES])
  corners?: CornerStyle;

  @IsOptional()
  @IsIn([...WEB_LAYOUTS])
  webLayout?: WebLayout;
}
