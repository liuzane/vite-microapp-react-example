// 基础模块
import { Routes, Route, Navigate } from 'react-router-dom';

// 自定义钩子
import { useGlobalDataListener } from './hooks';

// 页面
import User from './pages/User';
import Role from './pages/Role';

// 子应用名称
const MICRO_APP_NAME: string = window.__MICRO_APP_NAME__;

function App() {
  console.log(`${MICRO_APP_NAME} App 初始化`);
  // 监听全局数据变化
  useGlobalDataListener();

  return (
    <Routes>
      <Route index element={<Navigate to="/user" />} />
      <Route path="/user" element={<User />} />
      <Route path="/role" element={<Role />} />
    </Routes>
  );
}

export default App;
