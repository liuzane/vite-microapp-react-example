import type React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'micro-app': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & unknown;
    }
  }
}
