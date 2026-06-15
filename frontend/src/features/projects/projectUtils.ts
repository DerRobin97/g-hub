import type { ProjectDetailDto, ProjectTaskDto, ProjectTaskPriority } from '@g-hub/shared';

export const PM_PRIO: Record<ProjectTaskPriority, { color: string; label: string }> = {
  high: { color: 'var(--bad)', label: 'Hoch' },
  mid: { color: 'var(--warn)', label: 'Mittel' },
  low: { color: 'var(--text-3)', label: 'Niedrig' },
};

export function progress(done: number, total: number): number {
  return total ? done / total : 0;
}

export type GroupMode = 'phase' | 'member' | 'due';

export interface FlatTask {
  task: ProjectTaskDto;
  phaseName: string;
}

export function flatTasks(detail: ProjectDetailDto): FlatTask[] {
  return detail.phases.flatMap((ph) => ph.tasks.map((task) => ({ task, phaseName: ph.name })));
}

export interface TaskGroup {
  label: string;
  items: FlatTask[];
}

export function groupTasks(detail: ProjectDetailDto, mode: GroupMode): TaskGroup[] {
  const map: Record<string, FlatTask[]> = {};
  const order: string[] = [];
  for (const ft of flatTasks(detail)) {
    const key =
      mode === 'member'
        ? (ft.task.members[0]?.name ?? 'Ohne Zuständige')
        : mode === 'due'
          ? (ft.task.dueLabel ?? 'Ohne Datum')
          : ft.phaseName;
    if (!map[key]) {
      map[key] = [];
      order.push(key);
    }
    map[key].push(ft);
  }
  return order.map((label) => ({ label, items: map[label] }));
}

export function initial(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase();
}
