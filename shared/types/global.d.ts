declare global {
  interface Window {
    __MICRO_APP_NAME__: string;
    __MICRO_APP_BASE_ROUTE__: string;
    microApp: any;
  }

  type Resolve<T> = (value: T) => void;
  type Reject = (error: Error) => void;

  interface PageResponse<T> {
    data: T[];
    total: number;
  }

  interface MicroAppGlobalData {
    from: string;
    [appName: string]: {
      path?: string;
      ready?: boolean;
    };
  }
}

export {};
