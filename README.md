# Vite Microapp React Example

基于 Vite + React + micro-app + Module Federation 构建的微前端演示项目。包含一个主应用（Host）、一个共享模块（Shared）和两个业务子应用（订单/产品管理、用户/角色管理）。所有子应用的表格、分页、菜单组件及本地数据服务均来自 Shared 模块。

## 项目结构

```
vite-microapp-react-example/
├── host/                 # 主应用（基座） - 全局布局、菜单、子应用加载
├── shared/               # 共享模块 - 通用组件、IndexedDB 服务、模拟数据
├── app1/                 # 子应用1 - 订单管理、产品管理
└── app2/                 # 子应用2 - 用户管理、角色管理
```

## 模块说明

| 模块     | 描述                                                                 | 默认开发地址       |
| -------- | -------------------------------------------------------------------- | ------------------ |
| **host** | 主应用，提供整体布局、侧边栏菜单（来自 shared），动态加载子应用。       | `http://localhost:3000` |
| **shared** | 共享模块，暴露 Menu、DataTable、Pagination 组件，以及 IndexedDB 数据服务（订单/产品/用户/角色）。 | `http://localhost:3999` |
| **app1** | 子应用1，展示订单列表和产品列表，使用 shared 的表格、分页及数据服务。    | `http://localhost:3001` |
| **app2** | 子应用2，展示用户列表和角色列表，同样依赖 shared 的组件与数据服务。      | `http://localhost:3002` |

## 技术栈

- **微前端框架**：micro-app
- **构建工具**：Vite
- **前端框架**：React 19
- **模块共享**：Module Federation（`@module-federation/vite`）
- **本地数据**：IndexedDB（由 shared 统一管理）
- **路由**：React Router v6（host、app1、app2 各自独立路由）

## 快速开始

### 前置要求

- Node.js >= 22
- npm / yarn / pnpm

### 配置 Git 大小写敏感

Mac/Windows 用户请执行：

```bash
git config core.ignorecase false
```

### 安装依赖

依次进入每个模块目录安装依赖：

```bash
npm install --prefix host && npm install --prefix shared && npm install --prefix app1 && npm install --prefix app2
```

### 启动开发环境（推荐顺序）

1. **启动 shared 模块**（必须先启动，因为 host 和子应用都依赖它）

```bash
cd shared
npm run dev
```

2. **启动子应用 app1 和 app2**

```bash
# 新终端
cd app1 && npm run dev

# 新终端
cd app2 && npm run dev
```

3. **启动主应用 host**

```bash
cd host
npm run dev
```

4. 访问主应用：`http://localhost:3000`

> 若端口被占用，请查看各模块启动日志中的实际端口，并修改 host 中配置的子应用地址（环境变量）。

### 独立访问各模块

- Shared 用法示例：`http://localhost:3999` （展示 Menu、DataTable、Pagination 及 IndexedDB 操作示例）
- app1（订单/产品）：`http://localhost:3001` （可在该地址独立开发调试，但需要 shared 模块支持）
- app2（用户/角色）：`http://localhost:3002`
- host 主应用：`http://localhost:3000`

### 打包项目

在根目录执行以下命令：

```bash
npm run build --prefix host && npm run build --prefix shared && npm run build --prefix app1 && npm run build --prefix app2
```
所有子应用会在根目录的 `dist` 中生成微前端项目结构（host在 `dist/`，shared在 `dist/shared/`，app1在 `dist/app1/`，app2在 `dist/app2/`）

### 线上地址
https://liuzane.github.io/vite-microapp-react-example