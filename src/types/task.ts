export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  name: string;
  // 经办人
  processorId: number;
  projectId: number;
  // 任务组
  epicId: number;
  kanbanId: number;
  // bug or task
  typeId: number;
  note: string;
  priority?: TaskPriority;
  dueDate?: string;
}
