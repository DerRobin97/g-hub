import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { ASSET_KINDS, type AssetKind } from '@g-hub/shared';

/** Metadaten-Datensatz nach erfolgreichem Upload zum Bucket anlegen. */
export class CreateAssetDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  tag!: string;

  @IsIn([...ASSET_KINDS])
  kind!: AssetKind;

  @IsString()
  @MinLength(1)
  @MaxLength(150)
  mime!: string;

  @IsInt()
  @Min(0)
  size!: number;

  // Objekt-Schlüssel aus der vorherigen upload-url-Antwort.
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  storageKey!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  channel?: string;
}
