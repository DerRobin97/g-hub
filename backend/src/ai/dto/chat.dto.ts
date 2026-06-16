import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AI_ROLES, type AiRole } from '@g-hub/shared';

export class ChatMessageDto {
  @IsIn([...AI_ROLES])
  role!: AiRole;

  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  content!: string;
}

export class ChatDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];
}
