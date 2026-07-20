// 基础模块
import { useCallback, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import microApp from '@micro-zoe/micro-app';

// Redux
import { useAppDispatch } from '@/store/hooks';
import { setAppLoading } from '@/store/slices/appsLoadingSlice';

// 枚举
import { AppNameEnum } from '@/enmu';

// 类型
import type { NavigateFunction } from 'react-router-dom';
import type { AppDispatch } from '@/store';

/**
 * 监听全局数据变化
 */
export function useGlobalDataListener() {
  const navigate: NavigateFunction = useNavigate();
  const dispatch: AppDispatch = useAppDispatch();

  // 定义监听回调（使用 useCallback 保证引用稳定，便于移除）
  const globalDataListener: (globalData: MicroAppGlobalData) => void = useCallback(
    (globalData: MicroAppGlobalData) => {
      // 忽略来自主机应用的数据
      if (globalData.from === AppNameEnum.Host) return;

      console.log(`${AppNameEnum.Host} 收到数据:`, globalData);

      // 处理数据
      for (const appName of Object.keys(globalData)) {
        if (globalData[appName]?.ready) {
          dispatch(setAppLoading({ appName, loading: false }));
        }

        const navigatePath: string | undefined = globalData[appName]?.navigate;
        if (navigatePath) {
          navigate(navigatePath);
        }
      }
    },
    [],
  );

  // 在 DOM 更新后、浏览器绘制前同步执行，确保监听尽早生效
  useLayoutEffect(() => {
    // 添加全局数据监听（第二个参数 true 表示立即执行一次回调）
    microApp?.addGlobalDataListener(globalDataListener, true);

    // 清理监听
    return () => {
      console.log(`${AppNameEnum.Host} 卸载数据监听`);
      microApp?.removeGlobalDataListener(globalDataListener);
    };
  }, []);
}
