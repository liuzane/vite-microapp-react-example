// 类型
import type { DatabaseMapper } from 'mockDB/mapper';
import type { IOrder, IOrderSearchParams } from '@/models/order';

// 数据库名称
import { DATABASE_NAME } from 'shared/consts/db';

export default class OrderService {
  private orderMapper: DatabaseMapper<IOrder> | undefined;
  private initPromise?: Promise<void>;

  constructor() {}

  /**
   * 初始化数据库映射器
   */
  private async init(): Promise<void> {
    // 已初始化
    if (this.orderMapper) {
      return;
    }

    // 正在初始化，等待初始化完成
    if (this.initPromise) {
      return this.initPromise;
    }

    // 创建唯一初始化任务
    this.initPromise = this.initData();

    try {
      await this.initPromise;
    } finally {
      // 初始化结束（成功或失败）都清除锁
      this.initPromise = undefined;
    }
  }

  /**
   * 初始化数据
   */
  async initData(): Promise<void> {
    const { DatabaseMapper } = await import('mockDB/mapper');
    const { ORDER_STORE_NAME } = await import('mockDB/store-names');

    this.orderMapper = new DatabaseMapper<IOrder>(
      DATABASE_NAME,
      ORDER_STORE_NAME,
    );

    const count: number = await this.orderMapper.count();

    if (count === 0) {
      console.log('订单表为空，开始初始化...');
      const { orders } = await import('mockDB/data/orders');
      await this.orderMapper.insertBatch(orders as IOrder[]);
    }
  }

  /**
   * 获取 Mapper
   */
  async getMapper(): Promise<DatabaseMapper<IOrder>> {
    await this.init();
    return this.orderMapper!;
  }

  /**
   * 分页查询订单，支持订单号模糊搜索和状态筛选
   * @param params.currentPage 当前页码（从1开始）
   * @param params.pageSize 每页条数
   * @param params.searchText 订单号模糊匹配关键字
   * @param params.status 状态筛选（可选）
   */
  async getOrdersByPage(params: IOrderSearchParams): Promise<PageResponse<IOrder>> {
    await this.getMapper();
    const { currentPage, pageSize, searchText, status } = params;
    if (!currentPage || !pageSize) {
      throw new Error('currentPage 和 pageSize 是必填参数');
    }
    const filter = (item: IOrder): boolean => {
      const matchSearch: boolean = searchText
        ? item.orderNo.toLowerCase().includes(searchText.toLowerCase())
        : true;
      const matchStatus: boolean = status ? item.status === status : true;
      return matchSearch && matchStatus;
    };
    return this.orderMapper!.query(currentPage, pageSize, filter);
  }

  /**
   * 获取全量订单（用于统计）
   */
  async getAllOrders(): Promise<IOrder[]> {
    await this.getMapper();
    return this.orderMapper!.getAll();
  }

  /**
   * 获取单条订单
   */
  async getOrder(id: number): Promise<IOrder | undefined> {
    await this.getMapper();
    return this.orderMapper!.getByKey(id);
  }

  /**
   * 更新订单
   */
  async updateOrder(order: IOrder): Promise<void> {
    await this.getMapper();
    await this.orderMapper!.update(order);
  }

  /**
   * 删除订单
   */
  async deleteOrder(id: number): Promise<void> {
    await this.getMapper();
    await this.orderMapper!.deleteByKey(id);
  }

  /**
   * 插入订单
   */
  async insertOrder(order: IOrder): Promise<void> {
    await this.getMapper();
    await this.orderMapper!.insert(order);
  }

  /**
   * 重置数据库：清空所有数据并重新生成
   */
  async reset(): Promise<void> {
    await this.getMapper();
    const { orders } = await import('mockDB/data/orders');
    await this.orderMapper!.clear();
    await this.orderMapper!.insertBatch(orders as IOrder[]);
  }
}
