// 类型
import type { DatabaseMapper } from 'mockDB/mapper';
import type { IUser, IUserSearchParams } from '@/models/user';

// 数据库名称
import { DATABASE_NAME } from 'shared/consts/db';

export default class UserService {
  private userMapper: DatabaseMapper<IUser> | undefined;
  private initPromise?: Promise<void>;

  constructor() {}

  /**
   * 初始化数据库映射器
   */
  private async init(): Promise<void> {
    // 已初始化
    if (this.userMapper) {
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
    const { USER_STORE_NAME } = await import('mockDB/store-names');

    this.userMapper = new DatabaseMapper<IUser>(
      DATABASE_NAME,
      USER_STORE_NAME,
    );

    const count: number = await this.userMapper.count();

    if (count === 0) {
      console.log('用户表为空，开始初始化...');
      const { default: users } = await import('mockDB/data/users');
      await this.userMapper.insertBatch(users as IUser[]);
    }
  }

  /**
   * 获取 Mapper
   */
  async getMapper(): Promise<DatabaseMapper<IUser>> {
    await this.init();
    return this.userMapper!;
  }

  /**
   * 分页查询用户，支持姓名模糊搜索和状态筛选
   * @param params.currentPage 当前页码（从1开始）
   * @param params.pageSize 每页条数
   * @param params.searchText 用户姓名或邮箱模糊匹配关键字
   * @param params.status 状态筛选（可选）
   */
  async getUsersByPage(params: IUserSearchParams): Promise<PageResponse<IUser>> {
    await this.getMapper();
    const { currentPage, pageSize, searchText, status } = params;
    if (!currentPage || !pageSize) {
      throw new Error('currentPage 和 pageSize 是必填参数');
    }
    const filter = (item: IUser): boolean => {
      const matchSearch: boolean = searchText
        ? item.name.toLowerCase().includes(searchText.toLowerCase())
        || item.email.toLowerCase().includes(searchText.toLowerCase())
        : true;
      const matchStatus: boolean = status ? item.status === status : true;
      return matchSearch && matchStatus;
    };
    return this.userMapper!.query(currentPage, pageSize, filter);
  }

  /**
   * 获取全量用户（用于统计）
   */
  async getAllUsers(): Promise<IUser[]> {
    await this.getMapper();
    return this.userMapper!.getAll();
  }

  /**
   * 获取单条用户
   */
  async getUser(id: number): Promise<IUser | undefined> {
    await this.getMapper();
    return this.userMapper!.getByKey(id);
  }

  /**
   * 更新用户
   */
  async updateUser(user: IUser): Promise<void> {
    await this.getMapper();
    await this.userMapper!.update(user);
  }

  /**
   * 删除用户
   */
  async deleteUser(id: number): Promise<void> {
    await this.getMapper();
    await this.userMapper!.deleteByKey(id);
  }

  /**
   * 插入用户
   */
  async insertUser(user: IUser): Promise<void> {
    await this.getMapper();
    await this.userMapper!.insert(user);
  }

  /**
   * 重置数据库：清空所有数据并重新生成
   */
  async reset(): Promise<void> {
    await this.getMapper();
    const { default: users } = await import('mockDB/data/users');
    await this.userMapper!.clear();
    await this.userMapper!.insertBatch(users as IUser[]);
  }
}
