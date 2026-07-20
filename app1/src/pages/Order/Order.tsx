// 基础模块
import { useState, useEffect, useCallback } from 'react';
import {
  Input,
  Select,
  Button,
  Card,
  Space,
  Tag,
  message,
  Modal,
  Form,
  InputNumber,
  Descriptions,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';

// 远程组件
import { SharedTable, SharedPagination } from 'shared/components';

// 枚举
import { OrderStatusEnum } from '@/enums/order.enum';

// 类型
import type { TableProps } from 'antd';
import type {
  IOrderSearchParams,
  IOrder,
  OrderStatusType,
  IStatistics,
  IStatusConfig,
  IOrderEditForm,
} from '@/models/order';

// 数据服务
import OrderService from '@/services/OrderService';

const { Option } = Select;

// 订单状态映射
const STATUS_MAP: Record<OrderStatusType, IStatusConfig> = {
  [OrderStatusEnum.Pending]: { text: '待支付', color: 'warning' },
  [OrderStatusEnum.Paid]: { text: '已支付', color: 'processing' },
  [OrderStatusEnum.Shipped]: { text: '已发货', color: 'success' },
  [OrderStatusEnum.Completed]: { text: '已完成', color: 'default' },
  [OrderStatusEnum.Cancelled]: { text: '已取消', color: 'error' },
};

// 订单服务
const orderService: OrderService = new OrderService();

export default function Order() {
  // 状态管理
  const [dataSource, setDataSource] = useState<IOrder[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // 筛选条件
  const [searchText, setSearchText] = useState<string>('');
  const [orderStatus, setOrderStatus] = useState<OrderStatusType | ''>('');

  // 分页
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // 统计数据（需要全量数据计算）
  const [statistics, setStatistics] = useState<IStatistics>({
    total: 0,
    pending: 0,
    paid: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
  });

  // 对话框相关状态
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [currentRecord, setCurrentRecord] = useState<IOrder | null>(null);
  const [form] = Form.useForm<IOrderEditForm>();

  /**
   * 加载数据函数
   * @param params 查询参数
   */
  const loadData: (params?: IOrderSearchParams) => Promise<void> = useCallback(async (params?: IOrderSearchParams) => {
    setLoading(true);
    try {
      // 获取分页数据
      const { data, total: totalCount } = await orderService.getOrdersByPage({
        currentPage: params && 'currentPage' in params ? params.currentPage : currentPage,
        pageSize: params && 'pageSize' in params ? params.pageSize : pageSize,
        searchText: params && 'searchText' in params ? params.searchText : searchText,
        status: params && 'status' in params ? params.status : orderStatus,
      });

      setDataSource(data);
      setTotal(totalCount);

      // 加载统计数据（需要全量数据）
      const allOrders: IOrder[] = await orderService.getAllOrders();
      setStatistics({
        total: allOrders.length,
        pending: allOrders.filter((item: IOrder) => item.status === OrderStatusEnum.Pending).length,
        paid: allOrders.filter((item: IOrder) => item.status === OrderStatusEnum.Paid).length,
        shipped: allOrders.filter((item: IOrder) => item.status === OrderStatusEnum.Shipped).length,
        completed: allOrders.filter((item: IOrder) => item.status === OrderStatusEnum.Completed).length,
        cancelled: allOrders.filter((item: IOrder) => item.status === OrderStatusEnum.Cancelled).length,
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载订单数据失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchText, orderStatus]);

  // 初始化及筛选条件变化时加载数据
  useEffect(() => {
    loadData();
  }, []);

  // 当删除操作后，若当前页无数据且不是第一页，则跳转到上一页
  useEffect(() => {
    const totalPages: number = Math.ceil(total / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [total, pageSize, currentPage]);

  /**
   * 全局导航函数
   * @param path 导航路径
   */
  const globalNavigate = (path: string) => {
    window.microApp?.setGlobalData({
      from: window.__MICRO_APP_NAME__,
      [window.__MICRO_APP_NAME__]: {
        navigate: path,
      },
    });
  };

  /**
   * 查看商品详情
   */
  const onViewProduct = (record: IOrder): void => {
    globalNavigate(`/${window.__MICRO_APP_NAME__}/product?name=${record.productName}`);
  };

  /**
   * 查看客户详情
   */
  const onViewCustomer = (record: IOrder): void => {
    globalNavigate(`/app2/user?name=${record.customerName}`);
  };

  /**
   * 查看订单详情
   */
  const onView = (record: IOrder): void => {
    setCurrentRecord(record);
    setViewModalVisible(true);
  };

  /**
   * 编辑订单
   */
  const onEdit = (record: IOrder): void => {
    setCurrentRecord(record);
    form.setFieldsValue({
      productName: record.productName,
      amount: record.amount,
      status: record.status,
      customerName: record.customerName,
      phone: record.phone,
      address: record.address,
    });
    setEditModalVisible(true);
  };

  /**
   * 确认删除订单
   */
  const confirmDelete = (record: IOrder): void => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除订单 ${record.orderNo} 吗？此操作不可恢复。`,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await orderService.deleteOrder(record.id);
          await loadData(); // 重新加载当前页数据
          message.success(`删除订单：${record.orderNo} 成功`);
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败，请重试');
        }
      },
    });
  };

  /**
   * 保存编辑订单
   */
  const onEditSave = async (): Promise<void> => {
    try {
      const values: IOrderEditForm = await form.validateFields();
      if (currentRecord) {
        const updatedRecord: IOrder = {
          ...currentRecord,
          productName: values.productName,
          amount: values.amount,
          status: values.status,
          customerName: values.customerName,
          phone: values.phone,
          address: values.address,
        };
        await orderService.updateOrder(updatedRecord);
        await loadData();
        setEditModalVisible(false);
        message.success(`订单 ${currentRecord.orderNo} 更新成功`);
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  /**
   * 重置筛选条件
   */
  const onReset = (): void => {
    setSearchText('');
    setOrderStatus('');
    setCurrentPage(1);
    loadData({ searchText: '', status: '', currentPage: 1 });
  };

  /**
   * 执行搜索
   */
  const onSearch = (): void => {
    setCurrentPage(1);
    // 查询结果条数会在 loadData 后通过 total 显示，这里先不弹消息，以免重复
    loadData({ currentPage: 1 });
  };

  /**
   * 筛选状态变化处理
   */
  const onStatusChange = (status: OrderStatusType): void => {
    setSearchText('');
    setOrderStatus(status);
    setCurrentPage(1);
    loadData({ searchText: '', status, currentPage: 1 });
  };

  /**
   * 分页变化处理
   */
  const onPageChange = (page: number, size: number): void => {
    setCurrentPage(page);
    setPageSize(size);
    loadData({ currentPage: page, pageSize: size });
  };

  /**
   * 表格列定义
   */
  const columns: TableProps<IOrder>['columns'] = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 150,
      fixed: 'left',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
      render: (_value: string, record: IOrder) => (
        <Button
          type="link"
          size="small"
          onClick={() => onViewProduct(record)}
        >
          {record.productName}
        </Button>
      ),
    },
    {
      title: '客户信息',
      key: 'customerInfo',
      width: 140,
      render: (_value: string, record: IOrder) => (
        <Button
          type="link"
          size="small"
          onClick={() => onViewCustomer(record)}
        >
          {record.customerName}
        </Button>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => `¥ ${amount.toLocaleString()}`,
      sorter: (a: IOrder, b: IOrder) => a.amount - b.amount,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: OrderStatusType) => {
        const config: IStatusConfig = STATUS_MAP[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '下单时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 220,
      sorter: (a: IOrder, b: IOrder) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_value: string, record: IOrder) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="订单管理"
      variant="outlined"
    >
      {/* 统计卡片 */}
      <div className="mb-4 grid grid-cols-5 gap-4" style={{ marginBottom: 16 }}>
        <Card size="small" style={{ textAlign: 'center' }}>
          <div className="text-sm text-[#666]">总订单</div>
          <div className="text-2xl">
            <span
              className="text-primary cursor-pointer hover:opacity-75"
              onClick={onReset}
            >
              {statistics.total}
            </span>
          </div>
        </Card>
        <Card size="small" style={{ textAlign: 'center' }}>
          <div className="text-sm text-[#666]">待支付</div>
          <div className="text-2xl">
            <span
              className="text-warning cursor-pointer hover:opacity-75"
              onClick={() => onStatusChange(OrderStatusEnum.Pending)}
            >
              {statistics.pending}
            </span>
          </div>
        </Card>
        <Card size="small" style={{ textAlign: 'center' }}>
          <div className="text-sm text-[#666]">已支付</div>
          <div className="text-2xl">
            <span
              className="text-primary cursor-pointer hover:opacity-75"
              onClick={() => onStatusChange(OrderStatusEnum.Paid)}
            >
              {statistics.paid}
            </span>
          </div>
        </Card>
        <Card size="small" style={{ textAlign: 'center' }}>
          <div className="text-sm text-[#666]">已发货</div>
          <div className="text-2xl">
            <span
              className="text-success cursor-pointer hover:opacity-75"
              onClick={() => onStatusChange(OrderStatusEnum.Shipped)}
            >
              {statistics.shipped}
            </span>
          </div>
        </Card>
        <Card size="small" style={{ textAlign: 'center' }}>
          <div className="text-sm text-[#666]">已完成</div>
          <div className="text-2xl">
            <span
              className="text-gray-500 cursor-pointer hover:opacity-75"
              onClick={() => onStatusChange(OrderStatusEnum.Completed)}
            >
              {statistics.completed}
            </span>
          </div>
        </Card>
      </div>

      {/* 筛选项 */}
      <div className="mb-4 flex gap-4 flex-wrap" style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索订单号"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e: InputElementChangeEvent) => {
            setSearchText(e.target.value);
          }}
          onInput={(e: InputElementInputEvent) => {
            setSearchText((e.target as HTMLInputElement).value);
          }}
          style={{ width: 300 }}
          allowClear
        />
        <Select<OrderStatusType | ''>
          placeholder="选择订单状态"
          style={{ width: 150 }}
          value={orderStatus}
          onChange={(value: OrderStatusType | '') => {
            setOrderStatus(value);
          }}
        >
          <Option value="">全部状态</Option>
          {
            Object.keys(STATUS_MAP).map((key: string) => (
              <Option key={key} value={key}>{STATUS_MAP[key as OrderStatusType].text}</Option>
            ))
          }
        </Select>
        <Button type="primary" onClick={onSearch}>
          查询
        </Button>
        <Button onClick={onReset}>
          重置
        </Button>
      </div>

      {/* 表格 */}
      <SharedTable<IOrder>
        columns={columns}
        dataSource={dataSource}
        rowKey="orderNo"
        loading={loading}
        scroll={{ x: 1200 }}
      />

      {/* 分页 */}
      <SharedPagination
        current={currentPage}
        pageSize={pageSize}
        total={total}
        onChange={onPageChange}
        showSizeChanger
        showQuickJumper
      />

      {/* 查看订单对话框 */}
      <Modal
        title={`订单详情 - ${currentRecord?.orderNo || ''}`}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {currentRecord && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="订单号" span={2}>{currentRecord.orderNo}</Descriptions.Item>
            <Descriptions.Item label="商品名称" span={2}>{currentRecord.productName}</Descriptions.Item>
            <Descriptions.Item label="客户姓名">{currentRecord.customerName}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{currentRecord.phone}</Descriptions.Item>
            <Descriptions.Item label="订单金额">
              ¥
              {' '}
              {currentRecord.amount.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="订单状态">
              <Tag color={STATUS_MAP[currentRecord.status].color}>
                {STATUS_MAP[currentRecord.status].text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="下单时间" span={2}>{currentRecord.createTime}</Descriptions.Item>
            <Descriptions.Item label="收货地址" span={2}>{currentRecord.address}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 编辑订单对话框 */}
      <Modal
        title={`编辑订单 - ${currentRecord?.orderNo || ''}`}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={onEditSave}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            productName: '',
            amount: 0,
            status: OrderStatusEnum.Pending,
            customerName: '',
            phone: '',
            address: '',
          }}
        >
          <Form.Item
            name="productName"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="订单金额"
            rules={[
              { required: true, message: '请输入订单金额' },
              { type: 'number', min: 0.01, message: '金额必须大于0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              precision={2}
              prefix="¥"
              placeholder="请输入金额"
            />
          </Form.Item>
          <Form.Item
            name="status"
            label="订单状态"
            rules={[{ required: true, message: '请选择订单状态' }]}
          >
            <Select placeholder="请选择状态">
              {
                Object.values(OrderStatusEnum).map((status: OrderStatusEnum) => (
                  <Option key={status} value={status}>
                    {STATUS_MAP[status].text}
                  </Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item
            name="customerName"
            label="客户姓名"
            rules={[{ required: true, message: '请输入客户姓名' }]}
          >
            <Input placeholder="请输入客户姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
            ]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item
            name="address"
            label="收货地址"
            rules={[{ required: true, message: '请输入收货地址' }]}
          >
            <Input.TextArea rows={2} placeholder="请输入收货地址" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
