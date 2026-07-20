// Ant Design 组件
import { Table } from 'antd';

// 类型
import type { TableProps } from 'antd';

export default function SharedTable<T>(props: TableProps<T>) {
  return (
    <Table<T>
      bordered
      pagination={false}
      size="middle"
      {...props}
    />
  );
}
