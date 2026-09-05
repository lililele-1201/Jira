import React from "react";
import dayjs from "dayjs";
import styled from "@emotion/styled";
import { Button, Card, Dropdown, Menu, Modal, Tag } from "antd";
import bugIcon from "assets/bug.svg";
import taskIcon from "assets/task.svg";
import { Drag, Drop, DropChild } from "components/drag-and-drop";
import { Mark } from "components/mark";
import { Row } from "components/lib";
import {
  useKanbansQueryKey,
  useTaskRiskSearchParam,
  useTasksModal,
  useTasksSearchParams,
} from "screens/kanban/util";
import { CreateTask } from "screens/kanban/create-task";
import { Kanban } from "types/kanban";
import { Task, TaskPriority } from "types/task";
import { useDeleteKanban } from "utils/kanban";
import { useTaskTypes } from "utils/task-type";
import { useTasks } from "utils/task";
import { useUsers } from "utils/user";
import {
  filterTasks,
  getTaskRisk,
  normalizeTaskPriority,
} from "utils/task-risk";

const priorityMeta: Record<
  TaskPriority,
  { label: string; color: string }
> = {
  low: { label: "低优先级", color: "default" },
  medium: { label: "中优先级", color: "blue" },
  high: { label: "高优先级", color: "red" },
};

const TaskTypeIcon = ({ id }: { id: number }) => {
  const { data: taskTypes } = useTaskTypes();
  const name = taskTypes?.find((taskType) => taskType.id === id)?.name;
  if (!name) {
    return null;
  }
  return <img alt="任务类型" src={name === "task" ? taskIcon : bugIcon} />;
};

const TaskCard = ({ task }: { task: Task }) => {
  const { startEdit } = useTasksModal();
  const { name: keyword } = useTasksSearchParams();
  const { data: users } = useUsers();
  const processor = users?.find((user) => user.id === task.processorId);
  const priority = priorityMeta[normalizeTaskPriority(task.priority)];
  const risk = getTaskRisk(task.dueDate);

  return (
    <Card
      onClick={() => startEdit(task.id)}
      style={{ marginBottom: "0.8rem", cursor: "pointer" }}
      key={task.id}
      size="small"
    >
      <TaskName>
        <Mark keyword={keyword} name={task.name} />
      </TaskName>
      <MetaRow>
        <span>
          <TaskTypeIcon id={task.typeId} />
          <Tag color={priority.color}>{priority.label}</Tag>
        </span>
        <Assignee>{processor?.name || "未分配"}</Assignee>
      </MetaRow>
      {task.dueDate ? (
        <DeadlineRow>
          <span>截止 {dayjs(task.dueDate).format("MM-DD")}</span>
          {risk === "overdue" ? <Tag color="red">已逾期</Tag> : null}
          {risk === "dueSoon" ? <Tag color="orange">即将到期</Tag> : null}
        </DeadlineRow>
      ) : null}
    </Card>
  );
};

export const KanbanColumn = React.forwardRef<
  HTMLDivElement,
  { kanban: Kanban }
>(({ kanban, ...props }, ref) => {
  const { data: allTasks } = useTasks(useTasksSearchParams());
  const risk = useTaskRiskSearchParam();
  const tasks = filterTasks(
    allTasks?.filter((task) => task.kanbanId === kanban.id) || [],
    { risk }
  );

  return (
    <Container {...props} ref={ref}>
      <Row between>
        <h3>{kanban.name}</h3>
        <More kanban={kanban} />
      </Row>
      <TasksContainer>
        <Drop type="ROW" direction="vertical" droppableId={String(kanban.id)}>
          <DropChild style={{ minHeight: "1rem" }}>
            {tasks.map((task, taskIndex) => (
              <Drag
                key={task.id}
                index={taskIndex}
                draggableId={`task${task.id}`}
              >
                <div>
                  <TaskCard task={task} />
                </div>
              </Drag>
            ))}
          </DropChild>
        </Drop>
        <CreateTask kanbanId={kanban.id} />
      </TasksContainer>
    </Container>
  );
});

const More = ({ kanban }: { kanban: Kanban }) => {
  const { mutateAsync } = useDeleteKanban(useKanbansQueryKey());
  const startDelete = () => {
    Modal.confirm({
      okText: "确定",
      cancelText: "取消",
      title: "确定删除该看板列吗？",
      onOk: () => mutateAsync({ id: kanban.id }),
    });
  };
  const overlay = (
    <Menu>
      <Menu.Item>
        <Button type="link" danger onClick={startDelete}>
          删除
        </Button>
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown overlay={overlay}>
      <Button type="link">...</Button>
    </Dropdown>
  );
};

const TaskName = styled.p`
  margin-bottom: 1rem;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  img {
    margin-right: 0.8rem;
  }
`;

const Assignee = styled.span`
  color: rgb(94, 108, 132);
  font-size: 1.2rem;
`;

const DeadlineRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.8rem;
  color: rgb(94, 108, 132);
  font-size: 1.2rem;
`;

export const Container = styled.div`
  min-width: 27rem;
  border-radius: 6px;
  background-color: rgb(244, 245, 247);
  display: flex;
  flex-direction: column;
  padding: 0.7rem 0.7rem 1rem;
  margin-right: 1.5rem;
`;

const TasksContainer = styled.div`
  overflow: scroll;
  flex: 1;

  ::-webkit-scrollbar {
    display: none;
  }
`;
