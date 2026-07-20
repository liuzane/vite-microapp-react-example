// Ant Design 组件
import { Menu } from 'antd';

// 类型
import type { MenuProps } from 'antd';

export default function SharedMenu(props: MenuProps) {
  return (
    <Menu {...props} />
  );
}
