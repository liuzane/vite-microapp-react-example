// 基础模块
import { Layout } from 'antd';

// 组件
import AppSider from './AppSider';
import AppHeader from './AppHeader';

const { Content } = Layout;

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * 主布局组件
 * 负责整体布局
 */
export function AppLayout(props: LayoutProps) {
  const { children } = props;

  return (
    <Layout className="h-full">
      <AppSider />
      <Layout className="h-full">
        <AppHeader />
        <Content
          className="m-4 bg-white rounded-md overflow-auto relative"
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
