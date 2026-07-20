// 基础模块
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import zhCN from 'antd/locale/zh_CN';

// 样式
import './styles';

// 应用入口
import App from './App.tsx';

// 渲染应用
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={zhCN}>
      <HashRouter basename={window.__MICRO_APP_BASE_ROUTE__ || '/'}>
        <StyleProvider layer>
          <App />
        </StyleProvider>
      </HashRouter>
    </ConfigProvider>
  </StrictMode>,
);
