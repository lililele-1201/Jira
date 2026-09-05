import React, { useEffect } from "react";
import { Button, Form, Input, Modal } from "antd";
import { TaskPrioritySelect } from "components/task-priority-select";
import { TaskTypeSelect } from "components/task-type-select";
import { UserSelect } from "components/user-select";
import { useTasksModal, useTasksQueryKey } from "screens/kanban/util";
import { useDeleteTask, useEditTask } from "utils/task";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export const TaskModal = () => {
  const [form] = Form.useForm();
  const { editingTaskId, editingTask, close } = useTasksModal();
  const { mutateAsync: editTask, isLoading: editLoading } = useEditTask(
    useTasksQueryKey()
  );
  const { mutate: deleteTask } = useDeleteTask(useTasksQueryKey());

  const onCancel = () => {
    close();
    form.resetFields();
  };

  const onOk = async () => {
    const values = await form.validateFields();
    await editTask({ ...editingTask, ...values });
    close();
  };

  const startDelete = () => {
    close();
    Modal.confirm({
      okText: "确定",
      cancelText: "取消",
      title: "确定删除该任务吗？",
      onOk() {
        return deleteTask({ id: Number(editingTaskId) });
      },
    });
  };

  useEffect(() => {
    form.setFieldsValue({
      ...editingTask,
      priority: editingTask?.priority || "medium",
    });
  }, [form, editingTask]);

  return (
    <Modal
      forceRender
      onCancel={onCancel}
      onOk={onOk}
      okText="保存"
      cancelText="取消"
      confirmLoading={editLoading}
      title="编辑任务"
      visible={Boolean(editingTaskId)}
    >
      <Form {...layout} form={form}>
        <Form.Item
          label="任务名称"
          name="name"
          rules={[{ required: true, whitespace: true, message: "请输入任务名称" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="负责人" name="processorId">
          <UserSelect defaultOptionName="暂不分配" />
        </Form.Item>
        <Form.Item label="类型" name="typeId">
          <TaskTypeSelect />
        </Form.Item>
        <Form.Item label="优先级" name="priority">
          <TaskPrioritySelect />
        </Form.Item>
        <Form.Item label="截止日期" name="dueDate">
          <Input type="date" />
        </Form.Item>
      </Form>
      <div style={{ textAlign: "right" }}>
        <Button onClick={startDelete} size="small" danger>
          删除任务
        </Button>
      </div>
    </Modal>
  );
};
