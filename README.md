# GPU Maestro

GPU Maestro 是一个面向 AI / ML 团队的 GPU 工作负载管理界面示例项目，提供仪表盘、交互式沙箱、批处理训练任务、模型管理、数据集管理和文件管理等模块。

## 快速开始

### 环境要求

- Node.js 18+
- npm

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

默认会启动在 `http://localhost:3000`。如果本机端口冲突，可以改用：

```bash
npm run dev -- -p 3001
```

### 生产构建

```bash
npm run build
npm start
```

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Lucide React
- Recharts

## 主要模块

- 仪表盘：查看 GPU 利用率、任务概览和成本趋势
- 交互式沙箱：创建远程开发环境，支持终端和 VS Code 类工作流
- 批量任务：提交训练任务、选择资源来源、配置 GPU 硬件规格
- 模型管理：浏览模型版本并发起相关操作
- 数据集管理：查看和选择可用数据集
- 文件管理：管理共享文件与产物
- 管理面板：查看和调整平台级配置

## 项目结构

- `pages/`
  - `_app.tsx`：全局布局与导航
  - `index.tsx`：仪表盘页面
  - `sandboxes.tsx`：沙箱页面
  - `jobs.tsx`：批量任务页面
  - `models.tsx`：模型管理页面
  - `datasets.tsx`：数据集页面
  - `files.tsx`：文件管理页面
  - `admin.tsx`：管理面板页面
- `components/`
  - `Dashboard.tsx`：仪表盘组件
  - `Sandboxes.tsx`：沙箱模块
  - `BatchJobs.tsx`：批量任务模块
  - `ModelManagement.tsx`：模型管理模块
  - `DatasetManagement.tsx`：数据集模块
  - `FileManagement.tsx`：文件管理模块
  - `AdminPanel.tsx`：管理面板模块
- `constants.tsx`：模拟数据与常量
- `types.ts`：类型定义
- `styles/globals.css`：全局样式

## 开发说明

- 项目当前使用的是本地模拟数据，适合做界面开发、交互演示和前端原型验证。
- 运行状态摘要、日志和指标展示目前为前端静态或模拟内容，不依赖外部模型服务。
- 如果后续要接入真实后端接口，建议优先从 `pages/` 下的页面路由和 `components/` 下的模块边界开始拆分。

---

Built for local UI iteration and GPU platform workflow prototyping.
