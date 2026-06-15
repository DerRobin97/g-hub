import {
  IsArray,
  IsBoolean,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TASK_PRIORITY,
  TASK_ROLES,
  TASK_STATUS,
  type TaskPriority,
  type TaskRole,
  type TaskStatus,
} from '@g-hub/shared';

export class ChecklistItemInput {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;
}

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  projectText?: string;

  @IsOptional()
  @IsISO8601()
  dueDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  dueLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  time?: string;

  @IsOptional()
  @IsIn([...TASK_PRIORITY])
  priority?: TaskPriority;

  @IsOptional()
  @IsIn([...TASK_STATUS])
  status?: TaskStatus;

  @IsOptional()
  @IsIn([...TASK_ROLES])
  role?: TaskRole;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  tag?: string;

  // User-IDs der Beteiligten. Leer/ungesetzt → der Ersteller wird zugewiesen.
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assigneeIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemInput)
  checklist?: ChecklistItemInput[];
}
