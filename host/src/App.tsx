// 基础模块
import { Routes, Route, Navigate } from 'react-router-dom';
import { Typography } from 'antd';

// 自定义钩子
import { useGlobalDataListener } from '@/hooks';

// 枚举
import { AppNameEnum } from '@/enmu';

// 布局组件
import { AppLayout } from '@/layout';

// 微应用页面组件
import MicroAppPage from './MicroAppPage';

const { Title } = Typography;

// 微应用配置
const microAppConfigs: MicroAppConfig[] = [
  {
    name: AppNameEnum.Shared,
    url: import.meta.env.VITE_SHARED_URL,
  },
  {
    name: AppNameEnum.App1,
    url: import.meta.env.VITE_APP1_URL,
  },
  {
    name: AppNameEnum.App2,
    url: import.meta.env.VITE_APP2_URL,
  },
];

/**
 * 主应用组件
 * 负责路由管理和全局数据监听
 */
function App() {
  useGlobalDataListener();

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to={`/${AppNameEnum.App1}/`} />} />
        {
          microAppConfigs.map((config: MicroAppConfig) => (
            <Route
              key={config.name}
              path={`/${config.name}/*`}
              element={(
                <MicroAppPage
                  name={config.name}
                  url={config.url}
                />
              )}
            />
          ))
        }
        <Route
          path="*"
          element={(
            <div className="flex items-center justify-center h-64">
              <Title level={3} type="secondary">
                请选择一个微应用
              </Title>
            </div>
          )}
        />
      </Routes>
    </AppLayout>
  );
}

export default App;
