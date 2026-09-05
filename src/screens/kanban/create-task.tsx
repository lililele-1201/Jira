import React, { useState } from "react";
import { Button, Card, Form, Input, Space } from "antd";
import { TaskPrioritySelect } from "components/task-priority-select";
import { UserSelect } from "components/user-select";
import { useProjectIdInUrl, useTasksQueryKey } from "screens/kanban/util";
import { Task } from "types/task";
import { useAddTask } from "utils/task";

type CreateTaskValues = Pick<
  Task,
  "name" | "processorId" | "priority" | "dueDate"
>;

export const CreateTask = ({ kanbanId }: { kanbanId: number }) => {
  const [inputMode, setInputMode] = useState(false);
  const [form] = Form.useForm<CreateTaskValues>();
  const { mutateAsync: addTask, isLoading } = useAddTask(useTasksQueryKey());
  const projectId = useProjectIdInUrl();

  const close = () => {
    form.resetFields();
    setInputMode(false);
  };

  const submit = async () => {
    const values = await form.validateFields();
    await addTask({
      ...values,
      projectId,
      kanbanId,
      priority: values.priority || "medium",
    });
    close();
  };

  if (!inputMode) {
    return (
      <Button type="link" onClick={() => setInputMode(true)}>
        + 创建任务
      </Button>
    );
  }

  return (
    <Card size="small">
      <Form
        form={form}
        layout="vertical"
        initialValues={{ priority: "medium" }}
      >
        <Form.Item
          name="name"
          label="任务名称"
          rules={[{ required: true, whitespace: true, message: "请输入任务名称" }]}
        >
          <Input autoFocus placeholder="需要完成什么？" onPressEnter={submit} />
        </Form.Item>
        <Form.Item name="processorId" label="负责人">
          <UserSelect defaultOptionName="暂不分配" />
        </Form.Item>
        <Form.Item name="priority" label="优先级">
          <TaskPrioritySelect />
        </Form.Item>
        <Form.Item name="dueDate" label="截止日期">
          <Input type="date" />
        </Form.Item>
        <Space>
          <Button type="primary" loading={isLoading} onClick={submit}>
            创建
          </Button>
          <Button onClick={close}>取消</Button>
        </Space>
      </Form>
    </Card>
  );
};
