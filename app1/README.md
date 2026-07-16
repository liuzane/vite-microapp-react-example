# 子应用1 - 订单与产品管理

基于 Vite + React 构建的 micro-app 微前端子应用，提供订单和产品管理页面。表格和分页组件统一复用 `shared` 远程模块，数据存储依赖 `shared` 提供的 IndexedDB 本地数据库。

## 项目简介

该应用是 [Vite Microapp React Example](https://github.com/liuzane/vite-microapp-react-example.git) 的微前端子应用之一，独立开发、部署，并通过 `micro-app` 框架被主应用加载。主要业务功能：

- 订单列表：展示订单数据，支持分页浏览
- 产品列表：展示产品数据，支持分页浏览

所有表格展示及分页操作均使用 `shared` 远程模块中的通用组件，数据来源于 `shared` 模块封装的 IndexedDB 服务，实现前端本地数据持久化。

## 技术栈

| 技术                | 说明                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| Vite                | 构建工具，提供极速的开发服务器与打包能力                               |
| React 19            | UI 框架                                                             |
| React Router DOM v6 | 内部路由（订单 / 产品页面切换）                                       |
| Ant Design 6        | 组件库，提供一致的 UI 组件集                                         |
| micro-app           | 微前端框架，该应用作为子应用接入                                       |
| Module Federation   | 用于加载 `shared` 远程模块（表格、分页组件、IndexedDB 工具）           |
| IndexedDB           | 浏览器本地数据库，由 `shared` 模块统一管理与访问                       |

## 前置条件

- Node.js >= 22
- npm / yarn / pnpm 均可
- 了解 `micro-app` 基本概念
- `shared` 远程模块需要提前启动（开发时建议同时启动 `shared` 服务）

> 若 `shared` 模块独立运行，请参照其 README 启动开发服务器，确保 `shared` 的 Module Federation 入口可访问（默认地址 `http://localhost:3999`）。

## 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/liuzane/vite-microapp-react-example.git
cd app1

# 2. 安装依赖
npm install

# 3. 开发模式启动（需要确保 shared 模块已启动）
npm run dev

# 4. 生产构建
npm run build
```

应用默认运行在 `http://localhost:3001`（Vite 默认端口可能被占用，具体以终端输出为准）。

### 与主应用联调

1. 启动 `shared` 远程模块服务（提供组件与 IndexedDB API）
2. 启动本子应用
3. 启动主应用，在其配置中加载本子应用的开发入口：`http://localhost:3001/`  
   主应用通过 `<micro-app name="sub-app1" url="http://localhost:3001/"></micro-app>` 方式引用。

> 独立访问子应用（不通过主应用）时，请确保 `shared` 模块已被正确加载（通过 Module Federation 的 remote 配置），否则表格和分页组件无法显示。