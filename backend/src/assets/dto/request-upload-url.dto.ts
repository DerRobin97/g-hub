import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

/** Anforderung einer presigned Upload-URL vor dem eigentlichen Datei-Upload. */
export class RequestUploadUrlDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  filename!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(150)
  mime!: string;

  @IsInt()
  @Min(0)
  size!: number;
}
