// 基础模块
import { useState } from 'react';
import { Layout, Typography, Button, Modal, Card, Space, message } from 'antd';
import { SettingOutlined, ReloadOutlined } from '@ant-design/icons';

// 数据库名称
import { DATABASE_NAME } from 'shared/consts/db';

// 数据库表名
import {
  ORDER_STORE_NAME,
  PRODUCT_STORE_NAME,
  USER_STORE_NAME,
  ROLE_STORE_NAME,
} from 'mockDB/store-names';

// 类型
import type { DatabaseMapper } from 'mockDB/mapper';

const { Header } = Layout;
const { Title, Paragraph } = Typography;

/**
 * 头部组件
 * 负责展示标题和设置按钮，包含数据管理弹窗
 */
export function AppHeader() {
  const [modalVisible, setModalVisible] = useState(false);

  /**
   * 重置数据表函数
   * @param storeName - 数据库存储名称
   * @param tableName - 显示的表名
   */
  const onResetTable = async (storeName: string, tableName: string) => {
    Modal.confirm({
      title: '确认重置',
      content: `确定要重置 ${tableName}(${storeName}) 数据吗？此操作将清空现有数据并重新初始化。`,
      okText: '确认重置',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        const { DatabaseMapper } = await import('mockDB/mapper');
        const mapper: DatabaseMapper<unknown> = new DatabaseMapper<unknown>(DATABASE_NAME, storeName);
        switch (storeName) {
          case ORDER_STORE_NAME: {
            const { default: orders } = await import('mockDB/data/orders');
            await mapper.clear();
            await mapper.insertBatch(orders);
            break;
          }

          case PRODUCT_STORE_NAME: {
            const { default: products } = await import('mockDB/data/products');
            await mapper.clear();
            await mapper.insertBatch(products);
            break;
          }

          case USER_STORE_NAME: {
            const { default: users } = await import('mockDB/data/users');
            await mapper.clear();
            await mapper.insertBatch(users);
            break;
          }

          case ROLE_STORE_NAME: {
            const { default: roles } = await import('mockDB/data/roles');
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
    <>
      <Header
        className="bg-white px-6 flex items-center justify-between shadow-[0_1px_4px_rgba(0,21,41,0.08)]"
      >
        <Title level={4}>一个基于 Vite + React + MicroApp 的模块联邦微前端演示项目</Title>
        <SettingOutlined onClick={() => setModalVisible(true)} />
      </Header>

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
          <Paragraph type="secondary">
            点击下方按钮可重置对应数据表，重置后将清空现有数据并重新初始化。
          </Paragraph>
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
    </>
  );
}

export default AppHeader;
