// 类型
import type { DatabaseMapper } from 'mockDB/mapper';
import type { IProduct, IProductSearchParams } from '@/models/product';

// 数据库名称
import { DATABASE_NAME } from 'shared/consts/db';

export default class ProductService {
  private productMapper: DatabaseMapper<IProduct> | undefined;
  private initPromise?: Promise<void>;

  constructor() {}

  /**
   * 初始化数据库映射器
   */
  private async init(): Promise<void> {
    // 已初始化
    if (this.productMapper) {
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
    const { PRODUCT_STORE_NAME } = await import('mockDB/store-names');

    this.productMapper = new DatabaseMapper<IProduct>(
      DATABASE_NAME,
      PRODUCT_STORE_NAME,
    );

    const count: number = await this.productMapper.count();

    if (count === 0) {
      console.log('产品表为空，开始初始化...');
      const { default: products } = await import('mockDB/data/products');
      await this.productMapper.insertBatch(products as IProduct[]);
    }
  }

  /**
   * 获取 Mapper
   */
  async getMapper(): Promise<DatabaseMapper<IProduct>> {
    await this.init();
    return this.productMapper!;
  }

  /**
   * 分页查询产品，支持名称模糊搜索和分类、状态筛选
   * @param params.currentPage 当前页码（从1开始）
   * @param params.pageSize 每页条数
   * @param params.searchText 产品编号或名称模糊匹配关键字
   * @param params.category 分类筛选（可选）
   * @param params.status 状态筛选（可选）
   */
  async getProductsByPage(params: IProductSearchParams): Promise<PageResponse<IProduct>> {
    await this.getMapper();
    const { currentPage, pageSize, searchText, category, status } = params;
    if (!currentPage || !pageSize) {
      throw new Error('currentPage 和 pageSize 是必填参数');
    }
    const filter = (item: IProduct): boolean => {
      const matchSearch: boolean = searchText
        ? (item.name.toLowerCase().includes(searchText.toLowerCase())
          || item.productNo.toLowerCase().includes(searchText.toLowerCase()))
        : true;
      const matchCategory: boolean = category ? item.category === category : true;
      const matchStatus: boolean = status ? item.status === status : true;
      return matchSearch && matchCategory && matchStatus;
    };
    return this.productMapper!.query(currentPage, pageSize, filter);
  }

  /**
   * 获取全量产品（用于统计）
   */
  async getAllProducts(): Promise<IProduct[]> {
    await this.getMapper();
    return this.productMapper!.getAll();
  }

  /**
   * 获取单条产品
   */
  async getProduct(id: number): Promise<IProduct | undefined> {
    await this.getMapper();
    return this.productMapper!.getByKey(id);
  }

  /**
   * 更新产品
   */
  async updateProduct(product: IProduct): Promise<void> {
    await this.getMapper();
    await this.productMapper!.update(product);
  }

  /**
   * 删除产品
   */
  async deleteProduct(id: number): Promise<void> {
    await this.getMapper();
    await this.productMapper!.deleteByKey(id);
  }

  /**
   * 插入产品
   */
  async insertProduct(product: IProduct): Promise<void> {
    await this.getMapper();
    await this.productMapper!.insert(product);
  }

  /**
   * 重置数据库：清空所有数据并重新生成
   */
  async reset(): Promise<void> {
    await this.getMapper();
    const { default: products } = await import('mockDB/data/products');
    await this.productMapper!.clear();
    await this.productMapper!.insertBatch(products as IProduct[]);
  }
}
