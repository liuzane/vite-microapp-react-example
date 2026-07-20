// Ant Design 组件
import { ConfigProvider, Pagination } from 'antd';

// 类型
import type { PaginationProps } from 'antd';

// 国际化
import zhCN from 'antd/locale/zh_CN';

// 样式
import './SharedPagination.css';

export default function SharedPagination(props: PaginationProps) {
  const { current = 1, pageSize = 10, total = 0, ...restProps } = props;
  return (
    <ConfigProvider locale={zhCN}>
      <div className="shared-pagination">
        <div className="shared-pagination__left">
          共
          {total}
          条数据，当前显示第
          {(current - 1) * pageSize + 1}
          -
          {Math.min(current * pageSize, total)}
          条
        </div>
        <Pagination
          current={current}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={['10', '20', '50', '100']}
          showTotal={(total: number) => `共 ${total} 条`}
          {...restProps}
        />
      </div>
    </ConfigProvider>
  );
}
