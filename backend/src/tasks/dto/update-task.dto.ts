import {
  IsArray,
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
import { ChecklistItemInput } from './create-task.dto';

/**
 * Teil-Update einer Aufgabe. Alle Felder optional; nur Übermitteltes wird geändert.
 * `assigneeIds`/`checklist` ersetzen jeweils die komplette Liste, wenn gesetzt.
 */
export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

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
