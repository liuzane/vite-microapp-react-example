// 基础模块
import { Routes, Route, Navigate } from 'react-router-dom';

// 自定义钩子
import { useGlobalDataListener } from './hooks';

// 页面
import Order from './pages/Order';
import Product from './pages/Product';

const MICRO_APP_NAME: string = window.__MICRO_APP_NAME__;

function App() {
  console.log(`${MICRO_APP_NAME} App 初始化`);
  useGlobalDataListener();

  return (
    <Routes>
      <Route index element={<Navigate to="/order" />} />
      <Route path="/order" element={<Order />} />
      <Route path="/product" element={<Product />} />
    </Routes>
  );
}

export default App;
