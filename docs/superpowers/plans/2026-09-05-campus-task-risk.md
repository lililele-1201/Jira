# Campus Task Risk Reminder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add task priority, deadlines, risk highlighting, and URL-backed quick filters while renaming the product to “校园团队协作任务管理系统”.

**Architecture:** Keep the existing React Query and Mock API data flow. Put date classification and combined filtering in a pure utility so cards and filters share one rule; keep API-supported filters in the current query hook and apply deadline risk locally to returned tasks.

**Tech Stack:** React 17, TypeScript 4.9, React Query 3, React Router 6, Ant Design 4, dayjs, Jest via Create React App

**Spec:** `docs/superpowers/specs/2026-09-05-campus-task-risk-design.md`

## Global Constraints

- Keep the existing Mock API; do not add a real backend.
- The exact product name is “校园团队协作任务管理系统”, with no English product name.
- Missing legacy fields must remain valid: priority displays as medium and a missing deadline has no risk state.
- Overdue means before today; due soon means today through three calendar days from today.
- Do not add dashboards, notifications, calendars, realtime collaboration, or permissions.

---

### Task 1: Task metadata and deterministic risk rules

**Files:**
- Modify: `src/types/task.ts`
- Create: `src/utils/task-risk.ts`
- Create: `src/utils/task-risk.test.ts`
- Delete: `src/App.test.tsx` (broken default CRA placeholder test)

**Interfaces:**
- Produces: `TaskPriority = "low" | "medium" | "high"`
- Produces: `TaskRisk = "normal" | "dueSoon" | "overdue"`
- Produces: `getTaskRisk(dueDate?: string, today?: Dayjs): TaskRisk`
- Produces: `filterTasks(tasks: Task[], filters: { processorId?: number; risk?: TaskRiskFilter }, today?: Dayjs): Task[]`

- [ ] **Step 1: Write failing pure-function tests**

```ts
import dayjs from "dayjs";
import { filterTasks, getTaskRisk } from "utils/task-risk";

const today = dayjs("2026-09-05");

test.each([
  [undefined, "normal"],
  ["2026-09-04", "overdue"],
  ["2026-09-05", "dueSoon"],
  ["2026-09-08", "dueSoon"],
  ["2026-09-09", "normal"],
])("classifies %s as %s", (dueDate, expected) => {
  expect(getTaskRisk(dueDate, today)).toBe(expected);
});

test("combines assignee and risk filters", () => {
  const tasks = [
    { id: 1, name: "A", processorId: 7, dueDate: "2026-09-04" },
    { id: 2, name: "B", processorId: 8, dueDate: "2026-09-04" },
  ] as Task[];
  expect(filterTasks(tasks, { processorId: 7, risk: "overdue" }, today)).toEqual([tasks[0]]);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm.cmd test -- --watchAll=false src/utils/task-risk.test.ts`
Expected: FAIL because `utils/task-risk` does not exist.

- [ ] **Step 3: Add optional task fields and implement the minimal utility**

```ts
export type TaskPriority = "low" | "medium" | "high";
export type TaskRisk = "normal" | "dueSoon" | "overdue";
export type TaskRiskFilter = "all" | Exclude<TaskRisk, "normal">;

export const getTaskRisk = (dueDate?: string, today = dayjs()): TaskRisk => {
  if (!dueDate || !dayjs(dueDate).isValid()) return "normal";
  const days = dayjs(dueDate).startOf("day").diff(today.startOf("day"), "day");
  if (days < 0) return "overdue";
  return days <= 3 ? "dueSoon" : "normal";
};
```

Implement `filterTasks` as an immutable `Array.filter` using both optional filters; treat `risk: "all"` as no risk filter.

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm.cmd test -- --watchAll=false src/utils/task-risk.test.ts`
Expected: PASS with all table rows and the combined-filter test green.

- [ ] **Step 5: Commit the independently working utility**

```bash
git add src/types/task.ts src/utils/task-risk.ts src/utils/task-risk.test.ts src/App.test.tsx
git commit -m "feat: add task risk classification"
```

### Task 2: URL-backed deadline filters

**Files:**
- Modify: `src/screens/kanban/util.ts`
- Modify: `src/screens/kanban/search-panel.tsx`
- Modify: `src/screens/kanban/kanban-column.tsx`

**Interfaces:**
- Consumes: `TaskRiskFilter`, `filterTasks`
- Produces: `useTaskRiskSearchParam(): TaskRiskFilter`

- [ ] **Step 1: Extend the URL hook without sending `risk` to the Mock API**

Add `useTaskRiskSearchParam`, reading only `risk` with `useUrlQueryParam(["risk"])` and accepting `overdue` or `dueSoon`; return `all` for missing/invalid values. Keep `useTasksSearchParams` limited to fields the existing API understands.

- [ ] **Step 2: Add the three quick actions**

Use the authenticated user's `id` for a toggle button that sets `processorId`; add an Ant Design `Radio.Group` whose values are `all`, `dueSoon`, and `overdue`. Update reset to clear `risk` as well as the existing task filters.

- [ ] **Step 3: Apply the shared client-side risk filter**

In each `KanbanColumn`, obtain `risk` from `useTaskRiskSearchParam()` and derive visible tasks with:

```ts
const tasks = filterTasks(
  allTasks?.filter((task) => task.kanbanId === kanban.id) || [],
  { risk }
);
```

- [ ] **Step 4: Verify URL behavior manually**

Run: `npm.cmd start`
Expected: selecting each risk writes `risk=dueSoon` or `risk=overdue`; “仅看我的” writes the logged-in user's `processorId`; refreshing restores the same visible set; reset removes both.

- [ ] **Step 5: Commit the filter flow**

```bash
git add src/screens/kanban/util.ts src/screens/kanban/search-panel.tsx src/screens/kanban/kanban-column.tsx
git commit -m "feat: add task risk quick filters"
```

### Task 3: Create, edit, and display task metadata

**Files:**
- Create: `src/components/task-priority-select.tsx`
- Modify: `src/screens/kanban/create-task.tsx`
- Modify: `src/screens/kanban/task-modal.tsx`
- Modify: `src/screens/kanban/kanban-column.tsx`

**Interfaces:**
- Consumes: `TaskPriority`, `getTaskRisk`
- Produces: reusable `TaskPrioritySelect` compatible with Ant Design form values

- [ ] **Step 1: Create the priority selector**

Implement an Ant Design `Select` with `low`, `medium`, and `high` values and Chinese labels “低”、“中”、“高”. Preserve passed `value`, `onChange`, and other `SelectProps` so it works under `Form.Item`.

- [ ] **Step 2: Expand quick creation into a compact form**

Keep the current inline `CreateTask`, but collect `name`, `processorId`, `priority`, and `dueDate`; use an HTML date input to avoid adding a Moment dependency. Submit `priority: "medium"` by default, prevent empty names, and provide explicit create/cancel buttons instead of closing on input blur.

- [ ] **Step 3: Add fields to task editing**

Add `TaskPrioritySelect` and `<Input type="date" />` fields to `TaskModal`. Preserve the existing task values and mutation flow.

- [ ] **Step 4: Render concise metadata on each card**

Use existing users data to show the assignee name. Render priority tags with stable colors, show the formatted deadline, and render “已逾期” in red or “即将到期” in orange based on `getTaskRisk`. For legacy tasks use `task.priority || "medium"`; omit the deadline row when absent.

- [ ] **Step 5: Verify persistence and legacy compatibility manually**

Run: `npm.cmd start`
Expected: a new task retains all metadata after editing and reload; a legacy task still renders with medium priority and no warning; overdue and due-soon cards have the expected label.

- [ ] **Step 6: Commit the user-facing task metadata flow**

```bash
git add src/components/task-priority-select.tsx src/screens/kanban/create-task.tsx src/screens/kanban/task-modal.tsx src/screens/kanban/kanban-column.tsx
git commit -m "feat: add task priority and deadlines"
```

### Task 4: Product naming, documentation, and final verification

**Files:**
- Modify: `public/index.html`
- Modify: `src/unauthenticated-app/index.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: completed feature behavior from Tasks 1–3
- Produces: consistent Chinese product positioning and accurate setup/feature documentation

- [ ] **Step 1: Apply the exact product name**

Set the HTML title and unauthenticated screen heading/document title to “校园团队协作任务管理系统”. Do not include “Jira” or an English brand.

- [ ] **Step 2: Rewrite the README positioning and feature list**

Describe the app as a campus collaboration project for course groups, competition teams, and research groups. Document priority, deadlines, overdue/due-soon rules, URL-backed filters, existing optimistic updates, drag-and-drop, JWT handling, Mock API usage, setup, build, and deployment. Save as UTF-8 and remove the current mojibake.

- [ ] **Step 3: Run the focused tests**

Run: `npm.cmd test -- --watchAll=false`
Expected: all task-risk tests PASS and no React 17/Testing Library module error remains because the broken placeholder test has been removed.

- [ ] **Step 4: Run the production build**

Run: `npm.cmd run build`
Expected: exit code 0 with no new TypeScript or ESLint warning introduced by this feature; existing third-party source-map warnings may remain.

- [ ] **Step 5: Inspect the final diff and repository state**

Run: `git diff --check` and `git status --short`
Expected: no whitespace errors and only intentional implementation files are present. Do not push or deploy.

- [ ] **Step 6: Commit documentation and naming**

```bash
git add public/index.html src/unauthenticated-app/index.tsx README.md
git commit -m "docs: rename campus collaboration system"
```
