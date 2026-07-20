declare global {
  interface Window {
    __MICRO_APP_NAME__: string;
    __MICRO_APP_BASE_ROUTE__: string;
    microApp: any;
  }

  interface MicroAppConfig {
    name: string;
    url: string;
  }

  interface MicroAppGlobalData {
    from: string;
    [appName: string]: {
      path?: string;
      ready?: boolean;
      navigate?: string;
    };
  }
}

export {};
