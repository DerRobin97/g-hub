import { IsIn, IsISO8601, IsOptional, IsString } from 'class-validator';
import { TASK_STATUS, type TaskStatus } from '@g-hub/shared';

export class QueryTasksDto {
  // 'me' filtert auf Aufgaben, an denen der aktuelle Nutzer beteiligt ist.
  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsIn([...TASK_STATUS])
  status?: TaskStatus;

  // Fälligkeitstag (YYYY-MM-DD); filtert auf dueDate innerhalb dieses Tages.
  @IsOptional()
  @IsISO8601()
  date?: string;
}
