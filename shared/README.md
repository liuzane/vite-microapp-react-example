# Shared 模块 - 共享组件与数据服务

本模块是 [Vite Microapp React Example](https://github.com/liuzane/vite-microapp-react-example) 的公共远程模块，基于 Vite + React + Module Federation 构建。它为微前端体系中的主应用（Host）和子应用提供统一的 UI 组件、分页能力以及基于 IndexedDB 的本地数据服务，并内置订单、产品、用户、角色的模拟数据。

## 核心能力

| 能力分类     | 内容说明                                                                 |
| ------------ | ------------------------------------------------------------------------ |
| 通用组件     | `Menu` 导航菜单组件、`DataTable` 通用表格组件、`Pagination` 分页组件      |
| 数据服务     | IndexedDB 封装（初始化、CRUD、分页查询），支持 orders / products / users / roles 四张表 |
| 模拟数据     | 订单、产品、用户、角色的演示数据，便于快速开发和演示                       |
| 用法示例     | 提供组件使用演示页面，帮助主应用/子应用开发者理解如何集成                   |

所有组件和 API 均通过 Module Federation 暴露，供 Host、子应用1、子应用2 等远程加载。

## 技术栈

| 技术                | 说明                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| Vite                | 构建工具                                                             |
| React 19            | UI 框架                                                              |
| React Router DOM v6 | 内部路由（用户 / 角色页面切换）                                       |
| Ant Design 6        | 组件库，提供一致的 UI 组件集                                         |
| Module Federation   | 暴露远程模块（组件 + 工具函数）                                        |
| IndexedDB           | 浏览器本地数据库，实现前端数据持久化                                   |

## 前置条件

- Node.js >= 22
- 微前端主应用或其他子应用需要支持 Module Federation 加载

## 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/liuzane/vite-microapp-react-example.git
cd shared

# 2. 安装依赖
npm install

# 3. 开发模式启动
npm run dev

# 4. 生产构建
npm run build
```

默认运行地址：`http://localhost:3999`  
远程入口文件地址：`http://localhost:3999/remoteEntry.js`


使用方（主应用/子应用）需要动态导入：

```js
const  { Menu, DataTable, Pagination } = await import('shared/components');
const  { initIndexedDB } = await import('shared/db');
```