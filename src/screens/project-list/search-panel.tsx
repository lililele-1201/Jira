import React from "react"
import { Form,Input,Select } from "antd";
// 用户接口定义 - 描述用户数据结构
export interface User {
  id: string;           // 用户唯一标识
  name: string;         // 用户姓名
  email: string;        // 用户邮箱
  title: string;        // 用户职位
  organization: string; // 用户所属组织
  token:string          // 用户认证令牌
}

// 搜索面板组件属性接口
interface SearchPanelProps {
  users: User[],                        // 用户列表（用于渲染负责人下拉选项）
  param: {                              // 搜索参数对象
    name: string;                       // 项目名称关键词
    personId: string;                   // 负责人ID
  },
  setParam: (param: SearchPanelProps['param']) => void; // 更新搜索参数的函数
}

// 搜索面板组件 - 提供项目搜索和筛选功能
export const SearchPanel = ({users,param,setParam}: SearchPanelProps) => {

  return( 
  <Form style={{ marginBottom: "2rem" }} layout={"inline"}>
  <Form.Item>
    {/* 项目名称搜索框 - 双向绑定 param.name */}
    <Input 
    placeholder={'项目名'}
    type="text" 
    value={param.name} 
    onChange={evt => setParam({
      ...param,                          // 保留其他参数不变
      name:evt.target.value,             // 更新名称参数
    })} />
  </Form.Item>
  <Form.Item>
      {/* 负责人下拉选择框 - 双向绑定 param.personId */}
    <Select value={param.personId} onChange={value => setParam({
      ...param,                          // 保留其他参数不变
      personId:value          // 更新负责人参数
    })}>
      <option value={''}>负责人</option>  {/* 默认选项 */}
      {/* 遍历用户列表渲染选项 */}
      {
        users.map(user => 
        <Select.Option key={user.id} value={String(user.id)}>
        {user.name}
        </Select.Option>)
      }
    </Select>
  </Form.Item>
  </Form>
  );
};
