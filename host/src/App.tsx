// 基础模块
import { useEffect, useRef, useState } from 'react';
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Navigate,
  useParams,
} from 'react-router-dom';
import microApp from '@micro-zoe/micro-app';
import {
  Layout,
  Typography,
  Button,
  Modal,
  Card,
  Space,
  message,
  Spin,
} from 'antd';
import { AppstoreOutlined, SettingOutlined, ReloadOutlined } from '@ant-design/icons';

// Redux
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setAppLoading } from '@/store/slices/appsLoadingSlice';

// 类型
import type { DatabaseMapper } from 'mockDB/mapper';
import type { RefObject } from 'react';
import type { NavigateFunction, Location } from 'react-router-dom';
import type { RootState, AppDispatch } from '@/store';
import type { MenuProps } from 'antd';

// 常量
const { DATABASE_NAME } = await import('shared/consts/db');

// 数据库表名
const {
  ORDER_STORE_NAME,
  PRODUCT_STORE_NAME,
  USER_STORE_NAME,
  ROLE_STORE_NAME,
} = await import('mockDB/store-names');

// 远程组件
const { SharedMenu } = await import('shared/components');

type MenuItem = Required<MenuProps>['items'][number];

interface MicroAppConfig {
  name: string;
  url: string;
}

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const microAppConfigs: MicroAppConfig[] = [
  {
    name: 'app1',
    url: import.meta.env.VITE_APP1_URL,
  },
  {
    name: 'app2',
    url: import.meta.env.VITE_APP2_URL,
  },
  {
    name: 'shared',
    url: import.meta.env.VITE_SHARED_URL,
  },
];

const menuItems: MenuItem[] = [
  {
    key: 'app1',
    label: '微应用 1',
    icon: <AppstoreOutlined />,
    children: [
      { key: '/app1/order', label: '订单管理' },
      { key: '/app1/product', label: '产品管理' },
    ],
  },
  {
    key: 'app2',
    label: '微应用 2',
    icon: <AppstoreOutlined />,
    children: [
      { key: '/app2/user', label: '用户管理' },
      { key: '/app2/role', label: '角色管理' },
    ],
  },
  {
    key: 'shared',
    label: '共享组件',
    icon: <AppstoreOutlined />,
    children: [
      { key: '/shared/shared-menu-usage', label: '菜单组件' },
      { key: '/shared/shared-table-usage', label: '表格组件' },
      { key: '/shared/shared-pagination-usage', label: '分页组件' },
    ],
  },
];

function MicroAppPage(props: MicroAppConfig) {
  const { name: appName, url } = props;
  const { '*': subPath } = useParams<{ '*': string }>();
  const location: Location = useLocation();
  const microAppRef: RefObject<HTMLElement | null> = useRef<HTMLElement>(null);
  const appsLoading: Record<string, boolean> = useAppSelector((state: RootState) => state.appsLoading);

  useEffect(() => {
    if (!appName) return;
    microApp.setGlobalData(
      { [appName]: { path: subPath } },
      () => {
        console.log(`数据已经发送完成: ${appName}, { path: ${subPath} }`);
      },
    );
  }, [location.pathname, subPath]);

  return (
    <>
      {appsLoading[appName] && (
        <Spin
          spinning={appsLoading[appName]}
          description="应用加载中..."
          size="large"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      )}
      <micro-app
        ref={microAppRef}
        name={appName}
        url={url}
        iframe
        keep-alive
        clear-data
      />
    </>
  );
}

function App() {
  const navigate: NavigateFunction = useNavigate();
  const location: Location = useLocation();
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch: AppDispatch = useAppDispatch();

  const dataListener = (globalData: MicroAppGlobalData): void => {
    for (const appName of Object.keys(globalData)) {
      if (globalData[appName]?.ready) {
        dispatch(setAppLoading({ appName, loading: false }));
      }
    }
  };

  useEffect(() => {
    microApp.addGlobalDataListener(dataListener);
    return () => {
      microApp.removeGlobalDataListener(dataListener);
    };
  }, []);

  const onMenuClick: MenuProps['onClick'] = ({ key }: { key: string }) => {
    navigate(key);
  };

  const defaultOpenKeys: string[] = [location.pathname.split('/')[1]];
  const defaultSelectedKeys: string[] = [location.pathname];

  const onResetTable = async (storeName: string, tableName: string) => {
    Modal.confirm({
      title: '确认重置',
      content: `确定要重置 ${tableName}(${storeName}) 数据吗？此操作将清空现有数据并重新初始化。`,
      okText: '确认重置',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        // 数据库映射器
        const { DatabaseMapper } = await import('mockDB/mapper');
        const mapper: DatabaseMapper<unknown> = new DatabaseMapper<unknown>(DATABASE_NAME, storeName);
        switch (storeName) {
          case ORDER_STORE_NAME: {
            const { orders } = await import('mockDB/data/orders');
            await mapper.clear();
            await mapper.insertBatch(orders);
            break;
          }

          case PRODUCT_STORE_NAME: {
            const { products } = await import('mockDB/data/products');
            await mapper.clear();
            await mapper.insertBatch(products);
            break;
          }

          case USER_STORE_NAME: {
            const { users } = await import('mockDB/data/users');
            await mapper.clear();
            await mapper.insertBatch(users);
            break;
          }

          case ROLE_STORE_NAME: {
            const { roles } = await import('mockDB/data/roles');
            await mapper.clear();
            await mapper.insertBatch(roles);
            break;
          }
        }

        message.success(`重置 ${tableName}(${storeName}) 数据成功`);
      },
    });
  };

  return (
    <Layout className="h-full">
      <Sider width={220} theme="dark" breakpoint="lg" collapsible>
        <div className="h-16 flex items-center justify-center text-white text-2xl font-bold letter-spacing-1 bg-white/5">
          Micro Frontend
        </div>
        <SharedMenu
          theme="dark"
          mode="inline"
          defaultOpenKeys={defaultOpenKeys}
          defaultSelectedKeys={defaultSelectedKeys}
          items={menuItems}
          onClick={onMenuClick}
        />
      </Sider>
      <Layout className="h-full">
        <Header
          className="bg-white px-6 flex items-center justify-between shadow-[0_1px_4px_rgba(0,21,41,0.08)]"
        >
          <Title level={4}>一个基于 Vite + React + MicroApp 的模块联邦微前端 Example</Title>
          <SettingOutlined onClick={() => setModalVisible(true)} />
        </Header>
        <Content
          className="m-4 bg-white rounded-md overflow-auto relative"
        >
          <Routes>
            <Route path="/" element={<Navigate to="/app1/" />} />
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
                  <Typography.Title level={3} type="secondary">
                    请选择一个微应用
                  </Typography.Title>
                </div>
              )}
            />
          </Routes>
        </Content>
      </Layout>

      {/* 设置弹窗 */}
      <Modal
        title="数据管理"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        <div className="space-y-4">
          <Typography.Paragraph type="secondary">
            点击下方按钮可重置对应数据表，重置后将清空现有数据并重新初始化。
          </Typography.Paragraph>
          <Space orientation="vertical" size="middle" className="w-full">
            <Card
              title="微应用 1 数据"
              className="bg-gray-50"
            >
              <div className="flex flex-wrap gap-3">
                <Button
                  type="primary"
                  danger
                  icon={<ReloadOutlined />}
                  onClick={() => onResetTable(ORDER_STORE_NAME, '订单')}
                >
                  重置订单数据
                </Button>
                <Button
                  type="primary"
                  danger
                  icon={<ReloadOutlined />}
                  onClick={() => onResetTable(PRODUCT_STORE_NAME, '产品')}
                >
                  重置产品数据
                </Button>
              </div>
            </Card>
            <Card
              title="微应用 2 数据"
              className="bg-gray-50"
            >
              <div className="flex flex-wrap gap-3">
                <Button
                  type="primary"
                  danger
                  icon={<ReloadOutlined />}
                  onClick={() => onResetTable(USER_STORE_NAME, '用户')}
                >
                  重置用户数据
                </Button>
                <Button
                  type="primary"
                  danger
                  icon={<ReloadOutlined />}
                  onClick={() => onResetTable(ROLE_STORE_NAME, '角色')}
                >
                  重置角色数据
                </Button>
              </div>
            </Card>
          </Space>
        </div>
      </Modal>
    </Layout>
  );
}

export default App;
