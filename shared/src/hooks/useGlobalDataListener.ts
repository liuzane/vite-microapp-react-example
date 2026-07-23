// 基础模块
import { useCallback, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 类型
import type { NavigateFunction } from 'react-router-dom';

// 子应用名称
const MICRO_APP_NAME: string = window.__MICRO_APP_NAME__;

/**
 * 监听全局数据变化
 */
export function useGlobalDataListener() {
  const navigate: NavigateFunction = useNavigate();

  // 定义监听回调（使用 useCallback 保证引用稳定，便于移除）
  const globalDataListener: (globalData: MicroAppGlobalData) => void = useCallback(
    (globalData: MicroAppGlobalData) => {
      // 忽略来自主机应用的数据
      if (globalData.from === MICRO_APP_NAME) return;
      if (MICRO_APP_NAME in globalData) {
        const data: Record<string, unknown> = globalData[MICRO_APP_NAME];
        console.log(`${MICRO_APP_NAME} 收到数据:`, data);
        // 根据 path 进行路由跳转
        if (typeof data.path === 'string') {
          navigate(data.path);
        }
      }
    },
    [],
  );

  // 在 DOM 更新后、浏览器绘制前同步执行，确保监听尽早生效
  useLayoutEffect(() => {
    // 获取初始全局数据
    const globalData: MicroAppGlobalData = window.microApp?.getGlobalData() as unknown as MicroAppGlobalData;
    console.log(`${MICRO_APP_NAME} 初始化参数:`, globalData);

    // 通知父应用当前子应用已准备就绪
    window.microApp?.setGlobalData({
      from: MICRO_APP_NAME,
      [MICRO_APP_NAME]: { ...globalData[MICRO_APP_NAME], ready: true },
    });

    // 添加全局数据监听（第二个参数 true 表示立即执行一次回调）
    window.microApp?.addGlobalDataListener(globalDataListener, true);

    // 清理监听
    return () => {
      console.log(`${MICRO_APP_NAME} 卸载数据监听`);
      window.microApp?.removeGlobalDataListener(globalDataListener);
    };
  }, []);
}
