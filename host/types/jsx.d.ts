import type { MicroAppElement } from '@micro-zoe/micro-app';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'micro-app': MicroAppElement;
    }
  }
}
