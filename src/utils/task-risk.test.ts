import dayjs from "dayjs";
import { Task } from "types/task";
import {
  filterTasks,
  getTaskRisk,
  normalizeTaskRiskFilter,
} from "utils/task-risk";

const today = dayjs("2026-09-05");

test.each([
  [undefined, "normal"],
  ["not-a-date", "normal"],
  ["2026-09-04", "overdue"],
  ["2026-09-05", "dueSoon"],
  ["2026-09-08", "dueSoon"],
  ["2026-09-09", "normal"],
])("classifies deadline %s as %s", (dueDate, expected) => {
  expect(getTaskRisk(dueDate, today)).toBe(expected);
});

test("combines assignee and overdue filters", () => {
  const tasks: Task[] = [
    {
      id: 1,
      name: "需求分析",
      processorId: 7,
      projectId: 1,
      epicId: 1,
      kanbanId: 1,
      typeId: 1,
      note: "",
      dueDate: "2026-09-04",
    },
    {
      id: 2,
      name: "原型设计",
      processorId: 8,
      projectId: 1,
      epicId: 1,
      kanbanId: 1,
      typeId: 1,
      note: "",
      dueDate: "2026-09-04",
    },
    {
      id: 3,
      name: "页面开发",
      processorId: 7,
      projectId: 1,
      epicId: 1,
      kanbanId: 1,
      typeId: 1,
      note: "",
      dueDate: "2026-09-08",
    },
  ];

  expect(
    filterTasks(tasks, { processorId: 7, risk: "overdue" }, today).map(
      (task) => task.id
    )
  ).toEqual([1]);
});

test("the all risk filter keeps tasks without deadlines", () => {
  const task = {
    id: 1,
    name: "整理文档",
    processorId: 7,
    projectId: 1,
    epicId: 1,
    kanbanId: 1,
    typeId: 1,
    note: "",
  } as Task;

  expect(filterTasks([task], { risk: "all" }, today)).toEqual([task]);
});

test.each([
  ["overdue", "overdue"],
  ["dueSoon", "dueSoon"],
  ["all", "all"],
  ["unexpected", "all"],
  [undefined, "all"],
])("normalizes URL risk value %s to %s", (value, expected) => {
  expect(normalizeTaskRiskFilter(value)).toBe(expected);
});
