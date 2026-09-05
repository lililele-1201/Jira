import React from "react";
import { Button, Input, Radio } from "antd";
import { Row } from "components/lib";
import { TaskTypeSelect } from "components/task-type-select";
import { UserSelect } from "components/user-select";
import { useAuth } from "context/auth-context";
import {
  useTaskRiskSearchParam,
  useTasksSearchParams,
} from "screens/kanban/util";
import { useSetUrlSearchParam } from "utils/url";

export const SearchPanel = () => {
  const searchParams = useTasksSearchParams();
  const risk = useTaskRiskSearchParam();
  const setSearchParams = useSetUrlSearchParam();
  const { user } = useAuth();
  const onlyMine = Boolean(user?.id && searchParams.processorId === user.id);

  const reset = () => {
    setSearchParams({
      typeId: undefined,
      processorId: undefined,
      tagId: undefined,
      name: undefined,
      risk: undefined,
    });
  };

  return (
    <Row marginBottom={4} gap={true}>
      <Input
        style={{ width: "20rem" }}
        placeholder={"任务名称"}
        value={searchParams.name}
        onChange={(event) => setSearchParams({ name: event.target.value })}
      />
      <UserSelect
        defaultOptionName={"负责人"}
        value={searchParams.processorId}
        onChange={(value) => setSearchParams({ processorId: value })}
      />
      <TaskTypeSelect
        defaultOptionName={"类型"}
        value={searchParams.typeId}
        onChange={(value) => setSearchParams({ typeId: value })}
      />
      <Button
        type={onlyMine ? "primary" : "default"}
        onClick={() =>
          setSearchParams({ processorId: onlyMine ? undefined : user?.id })
        }
      >
        仅看我的
      </Button>
      <Radio.Group
        value={risk}
        buttonStyle="solid"
        onChange={(event) =>
          setSearchParams({
            risk: event.target.value === "all" ? undefined : event.target.value,
          })
        }
      >
        <Radio.Button value="all">全部</Radio.Button>
        <Radio.Button value="dueSoon">即将到期</Radio.Button>
        <Radio.Button value="overdue">已逾期</Radio.Button>
      </Radio.Group>
      <Button onClick={reset}>清除筛选</Button>
    </Row>
  );
};
