import * as React from 'react';

export interface ToastProps {
  [key: string]: any;
}

declare const Toast: React.ComponentClass<ToastProps>;

export default Toast;
