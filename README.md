# 校园团队协作任务管理系统

一款面向课程小组、竞赛团队和实验室课题组的轻量协作应用。团队可以拆分项目与 Epic，通过可拖拽看板分配任务、跟踪进度，并根据优先级和截止日期快速识别交付风险。

[在线演示](https://lililele-1201.github.io)

## 核心功能

- **身份认证**：支持注册、登录与退出；HTTP 工具自动注入 JWT，并在 401 响应时清理登录状态。
- **项目管理**：支持创建、编辑、删除和收藏项目，可按名称与负责人筛选。
- **任务看板**：支持看板列排序、任务排序与跨列移动。
- **Epic 任务组**：将多个任务归入同一阶段目标，记录起止时间。
- **任务风险跟踪**：为任务设置负责人、优先级和截止日期；自动标记已逾期及三天内到期任务。
- **快捷筛选**：支持“仅看我的”、“即将到期”和“已逾期”，筛选状态与 URL 同步，刷新后仍可恢复。
- **乐观更新**：收藏、增删改与拖拽操作即时更新 React Query 缓存，请求失败时回滚。

## 技术实现

- React 17 + TypeScript
- React Router v6 + HashRouter
- React Query v3
- Ant Design 4 + Emotion
- react-beautiful-dnd
- MSW / `jira-dev-tool` Mock API
- Jest + React Scripts
- GitHub Pages

## 项目结构

```text
src/
├── components/           # 通用 UI、选择器与拖拽封装
├── context/              # 认证与全局 Provider
├── screens/
│   ├── project-list/     # 项目列表与编辑
│   ├── project/          # 项目嵌套路由
│   ├── kanban/           # 看板、任务、风险筛选与拖拽
│   └── epic/             # Epic 任务组
├── types/                # TypeScript 数据模型
└── utils/                # HTTP、React Query Hooks 与纯函数
```

## 任务风险规则

截止日期早于当天时标记为“已逾期”；截止日期为当天至未来三天时标记为“即将到期”。该规则由无副作用工具函数统一处理，看板卡片、筛选与拖拽均使用同一组可见任务数据。

## 本地运行

需要 Node.js 16 或更高版本。

```bash
npm install
npm start
```

生产构建与测试：

```bash
npm test -- --watchAll=false
npm run build
```

## 数据与部署

开发环境通过 Mock Service Worker 和 `jira-dev-tool` 提供注册、登录及 CRUD 接口，用于模拟前后端分离的数据流。项目使用 HashRouter 适配 GitHub Pages 静态托管。

```bash
npm run deploy
```
