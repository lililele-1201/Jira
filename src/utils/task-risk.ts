import dayjs, { Dayjs } from "dayjs";
import { Task } from "types/task";

export type TaskRisk = "normal" | "dueSoon" | "overdue";
export type TaskRiskFilter = "all" | Exclude<TaskRisk, "normal">;

export const getTaskRisk = (
  dueDate?: string,
  today: Dayjs = dayjs()
): TaskRisk => {
  if (!dueDate || !dayjs(dueDate).isValid()) {
    return "normal";
  }

  const daysUntilDue = dayjs(dueDate)
    .startOf("day")
    .diff(today.startOf("day"), "day");

  if (daysUntilDue < 0) {
    return "overdue";
  }
  return daysUntilDue <= 3 ? "dueSoon" : "normal";
};

export const filterTasks = (
  tasks: Task[],
  filters: { processorId?: number; risk?: TaskRiskFilter },
  today: Dayjs = dayjs()
) =>
  tasks.filter((task) => {
    const matchesProcessor =
      !filters.processorId || task.processorId === filters.processorId;
    const matchesRisk =
      !filters.risk ||
      filters.risk === "all" ||
      getTaskRisk(task.dueDate, today) === filters.risk;
    return matchesProcessor && matchesRisk;
  });
