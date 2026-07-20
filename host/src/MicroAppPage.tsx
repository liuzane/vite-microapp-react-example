// 基础模块
import { useRef } from 'react';
import { Spin } from 'antd';

// Redux
import { useAppSelector } from '@/store/hooks';

// 类型
import type { RefObject } from 'react';
import type { RootState } from '@/store';

/**
 * 微应用页面组件
 * @param props - 微应用配置属性
 * @param props.name - 微应用名称
 * @param props.url - 微应用访问地址
 */
export function MicroAppPage(props: MicroAppConfig) {
  const { name: appName, url } = props;
  const microAppRef: RefObject<HTMLElement | null> = useRef<HTMLElement>(null);
  const appsLoading: Record<string, boolean> = useAppSelector((state: RootState) => state.appsLoading);

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
        baseroute={`/${appName}`}
        iframe
        keep-alive
        clear-data
      />
    </>
  );
}

export default MicroAppPage;
