import React from "react";
import { Select } from "antd";

type SelectProps = React.ComponentProps<typeof Select>;

export const TaskPrioritySelect = (props: SelectProps) => (
  <Select {...props}>
    <Select.Option value="low">低</Select.Option>
    <Select.Option value="medium">中</Select.Option>
    <Select.Option value="high">高</Select.Option>
  </Select>
);
