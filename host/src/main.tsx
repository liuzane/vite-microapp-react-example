// 基础模块
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import microApp from '@micro-zoe/micro-app';
import { StyleProvider } from '@ant-design/cssinjs';
import { Provider } from 'react-redux';

// 样式
import '@/styles';

// 数据库名称
import { DATABASE_NAME } from 'shared/consts/db';

// 数据库模块
import { initIndexedDB } from 'mockDB/init';

// Redux
import { store } from '@/store';
import { setAppLoading } from '@/store/slices/appsLoadingSlice';

// 应用入口
import App from './App.tsx';

// 初始化 IndexedDB
initIndexedDB(DATABASE_NAME).then(() => {
  // 启动 MicroApp
  microApp.start({
    'disableScopecss': true,
    'router-mode': 'native',
    // 全局生命周期钩子
    'lifeCycles': {
      created(_e: CustomEvent, appName: string) {
        console.log('Micro app created:', appName);
      },
      beforemount(_e: CustomEvent, appName: string) {
        console.log('Micro app beforemount:', appName);
        store.dispatch(setAppLoading({ appName, loading: true }));
      },
      mounted(_e: CustomEvent, appName: string) {
        console.log('Micro app mounted:', appName);
      },
      unmount(_e: CustomEvent, appName: string) {
        console.log('Micro app unmount:', appName);
        store.dispatch(setAppLoading({ appName, loading: false }));
      },
      error(_e: CustomEvent, appName: string) {
        console.error('Micro app error:', appName);
      },
    },
  });

  // 渲染应用
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Provider store={store}>
        <HashRouter>
          <StyleProvider layer>
            <App />
          </StyleProvider>
        </HashRouter>
      </Provider>
    </StrictMode>,
  );

  // 隐藏 loading 文本
  const el: HTMLElement | null = document.getElementById('loading')!;
  el.style.opacity = '0';
  el.addEventListener('transitionend', () => {
    el.remove();
  }, { once: true });
});
