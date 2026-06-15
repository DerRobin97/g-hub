import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  // Name des ersten Workspace (Mandant), der bei der Registrierung angelegt wird.
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  workspaceName!: string;
}
