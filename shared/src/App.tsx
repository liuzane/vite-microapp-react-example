// 基础模块
import { Routes, Route, Navigate } from 'react-router-dom';

// 自定义钩子
import { useGlobalDataListener } from './hooks';

// 组件
import SharedMenuUsage from './pages/SharedMenuUsage';
import SharedTableUsage from './pages/SharedTableUsage';
import SharedPaginationUsage from './pages/SharedPaginationUsage';

const MICRO_APP_NAME: string = window.__MICRO_APP_NAME__;

function App() {
  console.log(`${MICRO_APP_NAME} App 初始化`);
  // 监听全局数据变化
  useGlobalDataListener();

  return (
    <Routes>
      <Route index element={<Navigate to="/shared-menu-usage" />} />
      <Route path="/shared-menu-usage" element={<SharedMenuUsage />} />
      <Route path="/shared-table-usage" element={<SharedTableUsage />} />
      <Route path="/shared-pagination-usage" element={<SharedPaginationUsage />} />
    </Routes>
  );
}

export default App;
