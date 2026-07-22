# Jira 项目管理系统

基于 React 全家桶构建的类 Jira 项目管理工具，支持看板拖拽、任务组管理、乐观更新等功能。

🔗 **在线演示**：[https://lililele-1201.github.io](https://lililele-1201.github.io)

## ✨ 功能特性

- **用户认证** — 登录 / 注册 / 登出，基于 JWT 的身份验证
- **项目管理** — 项目创建、编辑、删除、收藏，支持名称和负责人筛选搜索
- **看板管理** — 自定义看板列，支持拖拽排序看板和任务
- **任务管理** — 任务创建、编辑、删除，支持跨看板列拖拽移动
- **任务组 (Epic)** — 任务分组管理，支持开始/结束时间
- **乐观更新** — 收藏、排序等操作即时反馈，失败自动回滚
- **拖拽排序** — 基于 react-beautiful-dnd 的看板列和任务拖拽排序
- **快捷导航** — 项目收藏 Popover 和用户信息 Popover

## 🛠 技术栈

| 类别 | 技术 |
|---|---|
| 框架 | React 17 + TypeScript |
| 构建工具 | Create React App (Craco) |
| UI 组件库 | Ant Design 4.x |
| 路由 | React Router v6 (HashRouter) |
| 服务端状态 | React Query v3 |
| 拖拽 | react-beautiful-dnd |
| 样式 | Emotion (CSS-in-JS) |
| API 模拟 | MSW (Mock Service Worker) + json-server |
| 日期处理 | dayjs |
| 部署 | GitHub Pages (gh-pages) |

## 📁 项目结构

```
src/
├── assets/               # 静态资源（SVG Logo等）
├── auth-provider.ts      # JWT 认证提供层（token 存储 / 登录 / 注册）
├── authenticated-app.tsx  # 登录后主应用（路由、导航栏、用户菜单）
├── unauthenticated-app/  # 未登录页面（登录 / 注册）
├── components/           # 通用组件
│   ├── drag-and-drop.tsx # 拖拽容器组件
│   ├── error-boundary.tsx# 错误边界
│   ├── lib.tsx           # 通用布局组件（Row, ScreenContainer等）
│   ├── pin.tsx           # 收藏按钮
│   ├── mark.tsx          # 高亮标记组件
│   ├── user-popover.tsx  # 用户信息弹窗
│   ├── project-popover.tsx # 项目收藏快捷导航
│   └── ...               # 选择器组件
├── context/              # React Context
│   ├── auth-context.tsx  # 认证状态上下文
│   └── index.tsx         # 全局 Provider 组合
├── screens/              # 页面
│   ├── project-list/     # 项目列表页（搜索 / 创建 / 编辑 / 收藏）
│   ├── project/          # 项目详情页（看板 / 任务组 子路由）
│   ├── kanban/           # 看板页（看板列拖拽 / 任务拖拽 / 搜索）
│   └── epic/             # 任务组页（创建 / 删除 / 关联任务）
├── types/                # TypeScript 类型定义
├── utils/                # 工具函数和自定义 Hooks
│   ├── http.ts           # HTTP 请求封装（JWT 注入 / 401 拦截）
│   ├── project.ts        # 项目 CRUD + 乐观更新 Hooks
│   ├── kanban.ts         # 看板 CRUD + 排序 Hooks
│   ├── task.ts           # 任务 CRUD + 排序 Hooks
│   ├── epic.ts           # 任务组 CRUD Hooks
│   └── ...
└── App.tsx               # 应用入口
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

浏览器打开 [http://localhost:3000](http://localhost:3000)，使用 json-server 模拟后端，MSW 拦截 API 请求返回 Mock 数据。

### 构建生产版本

```bash
npm run build
```

### 部署到 GitHub Pages

```bash
npm run deploy
```

## 📖 核心实现

### 认证流程

- 登录/注册后 JWT Token 存入 `localStorage`
- 所有 API 请求通过 `useHttp` 自动注入 `Authorization: Bearer <token>`
- 401 响应自动登出
- 页面刷新通过 `bootstrapUser` 恢复登录态

### 乐观更新

收藏、排序等操作先更新 UI 缓存（React Query `onMutate`），成功则保持，失败则回滚：

```ts
// 典型乐观更新模式（utils/use-optimistic-options.ts）
useMutation(apiCall, {
  onMutate: (target) => {
    // 1. 取消轮询
    queryClient.cancelQueries(queryKey)
    // 2. 快照旧数据
    const previous = queryClient.getQueryData(queryKey)
    // 3. 乐观更新缓存
    queryClient.setQueryData(queryKey, (old) => updateOptimistic(old, target))
    return { previous }
  },
  onError: (err, target, context) => {
    // 失败时回滚
    queryClient.setQueryData(queryKey, context.previous)
  },
})
```

### 拖拽排序

基于 `react-beautiful-dnd` 实现看板列和任务的拖拽：

- **看板列排序** — 水平拖拽看板列，计算 `fromId` / `referenceId` 和 `type`（before/after）
- **任务排序** — 垂直拖拽任务，支持跨看板列移动，同时更新 `kanbanId`

### 自定义 Hooks

| Hook | 用途 |
|---|---|
| `useProjects` | 项目列表查询 |
| `useKanbans` | 看板列表查询 + 排序 |
| `useTasks` | 任务列表查询 + 排序 |
| `useEpics` | 任务组查询 + 删除 |
| `useUsers` | 用户列表查询 |
| `useAuth` | 认证状态（登录/注册/登出） |
| `useHttp` | 自动注入 JWT 的 HTTP 请求 |
| `useDebounce` | 防抖（搜索优化） |
| `useAsync` | 异步状态管理 |
| `useUndo` | 撤销操作 |
| `useOptimisticOptions` | 乐观更新配置 |
| `useDocumentTitle` | 页面标题设置 |

### API 模拟

开发环境下使用 MSW + json-server：

- `public/mockServiceWorker.js` — MSW Service Worker
- API 请求被 MSW 拦截并转发到 json-server，返回 Mock 数据
- 支持完整的 CRUD 操作和关联查询

## 📄 License

MIT
