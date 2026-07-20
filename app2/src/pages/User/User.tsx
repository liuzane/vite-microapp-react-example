// 基础模块
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Switch,
  Descriptions,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';

// 远程组件
import { SharedTable, SharedPagination } from 'shared/components';

// 枚举
import { UserStatusEnum } from '@/enums/user.enum';

// 类型
import type { TableProps } from 'antd';
import type {
  IUserSearchParams,
  IUser,
  UserStatusType,
  IStatusConfig,
  IUserEditForm,
} from '@/models/user';

// 数据服务
import UserService from '@/services/UserService';

const { Option } = Select;

const STATUS_MAP: Record<UserStatusType, IStatusConfig> = {
  [UserStatusEnum.Active]: { text: '启用', color: 'success' },
  [UserStatusEnum.Disabled]: { text: '禁用', color: 'default' },
};

// 用户服务
const userService: UserService = new UserService();

export default function User() {
  // 路由参数
  const [searchParams] = useSearchParams();

  // 状态管理
  const [dataSource, setDataSource] = useState<IUser[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // 筛选条件
  const [searchText, setSearchText] = useState<string>('');
  const [userStatus, setUserStatus] = useState<UserStatusType | ''>('');

  // 分页
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // 对话框相关状态
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [currentRecord, setCurrentRecord] = useState<IUser | null>(null);
  const [form] = Form.useForm<IUserEditForm>();

  /**
   * 加载数据函数
   * @param params 查询参数
   */
  const loadData: (params?: IUserSearchParams) => Promise<void> = useCallback(async (params?: { currentPage?: number; pageSize?: number; searchText?: string; status?: UserStatusType | '' }) => {
    setLoading(true);
    try {
      const { data, total: totalCount } = await userService.getUsersByPage({
        currentPage: params && 'currentPage' in params ? params.currentPage : currentPage,
        pageSize: params && 'pageSize' in params ? params.pageSize : pageSize,
        searchText: params && 'searchText' in params ? params.searchText : searchText,
        status: params && 'status' in params ? params.status : userStatus,
      });
      setDataSource(data);
      setTotal(totalCount);
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载用户数据失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchText, userStatus]);

  // 初始化及筛选条件变化时加载数据
  useEffect(() => {
    const name: string | null = searchParams.get('name');
    console.log('name:', name);
    if (name) {
      setSearchText(name);
      loadData({ searchText: name });
    } else {
      loadData();
    }
  }, []);

  // 当删除操作后，若当前页无数据且不是第一页，则跳转到上一页
  useEffect(() => {
    const totalPages: number = Math.ceil(total / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [total, pageSize, currentPage]);

  /**
   * 查看用户详情
   */
  const onView = (record: IUser): void => {
    setCurrentRecord(record);
    setViewModalVisible(true);
  };

  /**
   * 编辑用户
   */
  const onEdit = (record: IUser): void => {
    setCurrentRecord(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      phone: record.phone,
      status: record.status,
      role: record.role,
    });
    setEditModalVisible(true);
  };

  /**
   * 新增用户
   */
  const onAdd = (): void => {
    setCurrentRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: UserStatusEnum.Active,
    });
    setEditModalVisible(true);
  };

  /**
   * 确认删除用户
   */
  const confirmDelete = (record: IUser): void => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 ${record.name} 吗？此操作不可恢复。`,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await userService.deleteUser(record.id);
          await loadData();
          message.success(`删除用户：${record.name} 成功`);
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败，请重试');
        }
      },
    });
  };

  /**
   * 保存编辑用户
   */
  const onEditSave = async (): Promise<void> => {
    try {
      const values: IUserEditForm = await form.validateFields();
      if (currentRecord) {
        // 更新
        const updatedRecord: IUser = {
          ...currentRecord,
          name: values.name,
          email: values.email,
          phone: values.phone,
          status: values.status,
          role: values.role,
        };
        await userService.updateUser(updatedRecord);
        await loadData();
        setEditModalVisible(false);
        message.success(`用户 ${currentRecord.name} 更新成功`);
      } else {
        // 新增
        const newUser: IUser = {
          id: Date.now(),
          name: values.name,
          email: values.email,
          phone: values.phone,
          status: values.status,
          role: values.role,
          roleId: 5,
          createTime: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-'),
          lastLoginTime: '-',
        };
        await userService.insertUser(newUser);
        await loadData();
        setEditModalVisible(false);
        message.success(`用户 ${newUser.name} 创建成功`);
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  /**
   * 切换用户状态
   */
  const onToggleStatus = async (checked: boolean, record: IUser): Promise<void> => {
    try {
      const newStatus: UserStatusType = checked ? UserStatusEnum.Active : UserStatusEnum.Disabled;
      const updatedRecord: IUser = {
        ...record,
        status: newStatus,
      };
      await userService.updateUser(updatedRecord);
      await loadData();
      message.success(`用户 "${record.name}" 状态已更新为「${STATUS_MAP[newStatus].text}」`);
    } catch (error) {
      console.error('状态切换失败:', error);
      message.error('状态切换失败，请重试');
    }
  };

  /**
   * 重置筛选条件
   */
  const onReset = (): void => {
    setSearchText('');
    setUserStatus('');
    setCurrentPage(1);
    loadData({ searchText: '', status: '', currentPage: 1 });
  };

  /**
   * 执行搜索
   */
  const onSearch = (): void => {
    setCurrentPage(1);
    loadData({ currentPage: 1 });
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
  const columns: TableProps<IUser>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: UserStatusType, record: IUser) => (
        <Space>
          <Tag color={STATUS_MAP[status].color}>{STATUS_MAP[status].text}</Tag>
          <Switch
            size="small"
            checked={status === UserStatusEnum.Active}
            onChange={(checked: boolean) => onToggleStatus(checked, record)}
          />
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 180,
      sorter: (a: IUser, b: IUser) => {
        if (a.lastLoginTime === '-' || b.lastLoginTime === '-') return 0;
        return new Date(a.lastLoginTime).getTime() - new Date(b.lastLoginTime).getTime();
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      sorter: (a: IUser, b: IUser) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_: unknown, record: IUser) => (
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
      title="用户管理"
      variant="outlined"
    >
      {/* 筛选项 */}
      <div className="mb-4 flex gap-4 flex-wrap" style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索用户姓名或邮箱"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e: InputElementChangeEvent) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
          style={{ width: 300 }}
          allowClear
        />
        <Select<UserStatusType | ''>
          placeholder="选择状态"
          style={{ width: 150 }}
          value={userStatus}
          onChange={(value: UserStatusType | '') => {
            setUserStatus(value);
            setCurrentPage(1);
          }}
          allowClear
        >
          <Option value="">全部状态</Option>
          {
            Object.keys(STATUS_MAP).map((key: string) => (
              <Option key={key} value={key}>{STATUS_MAP[key as UserStatusType].text}</Option>
            ))
          }
        </Select>
        <Button type="primary" onClick={onSearch}>
          查询
        </Button>
        <Button onClick={onReset}>
          重置
        </Button>
        <Button className="ml-auto" type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          新增用户
        </Button>
      </div>

      {/* 表格 */}
      <SharedTable<IUser>
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
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

      {/* 查看用户对话框 */}
      <Modal
        title={`用户详情 - ${currentRecord?.name || ''}`}
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
            <Descriptions.Item label="用户ID">{currentRecord.id}</Descriptions.Item>
            <Descriptions.Item label="用户角色">{currentRecord.role}</Descriptions.Item>
            <Descriptions.Item label="用户姓名" span={2}>{currentRecord.name}</Descriptions.Item>
            <Descriptions.Item label="电子邮箱">{currentRecord.email}</Descriptions.Item>
            <Descriptions.Item label="手机号码">{currentRecord.phone}</Descriptions.Item>
            <Descriptions.Item label="用户状态">
              <Tag color={STATUS_MAP[currentRecord.status].color}>
                {STATUS_MAP[currentRecord.status].text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>{currentRecord.createTime}</Descriptions.Item>
            <Descriptions.Item label="最后登录" span={2}>{currentRecord.lastLoginTime || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 新增/编辑用户对话框 */}
      <Modal
        title={currentRecord ? `编辑用户 - ${currentRecord.name}` : '新增用户'}
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
            status: UserStatusEnum.Active,
          }}
        >
          <Form.Item
            name="name"
            label="用户姓名"
            rules={[{ required: true, message: '请输入用户姓名' }]}
          >
            <Input placeholder="请输入用户姓名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="电子邮箱"
            rules={[
              { required: true, message: '请输入电子邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入电子邮箱" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号码"
            rules={[
              { required: true, message: '请输入手机号码' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
            ]}
          >
            <Input placeholder="请输入手机号码" />
          </Form.Item>
          <Form.Item
            name="status"
            label="用户状态"
            rules={[{ required: true, message: '请选择用户状态' }]}
          >
            <Select placeholder="请选择状态">
              {
                Object.values(UserStatusEnum).map((status: UserStatusEnum) => (
                  <Option key={status} value={status}>
                    {STATUS_MAP[status].text}
                  </Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item
            name="role"
            label="用户角色"
            rules={[{ required: true, message: '请选择用户角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="超级管理员">超级管理员</Option>
              <Option value="管理员">管理员</Option>
              <Option value="产品经理">产品经理</Option>
              <Option value="运营专员">运营专员</Option>
              <Option value="普通用户">普通用户</Option>
              <Option value="访客">访客</Option>
              <Option value="数据分析师">数据分析师</Option>
              <Option value="财务人员">财务人员</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
