/**
 * Toast notification utility
 * Wrapper around react-fox-toast for consistent notifications
 */

import { toast } from 'react-fox-toast';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastOptions {
  duration?: number;
  position?: ToastPosition;
}

/**
 * Show a toast notification
 */
export function showToast(
  message: string,
  type: ToastType = 'info',
  options?: ToastOptions
) {
  const config: { duration: number; position: ToastPosition } = {
    duration: options?.duration || 3000,
    position: options?.position || 'top-right',
  };

  switch (type) {
    case 'success':
      toast.success(message, config);
      break;
    case 'error':
      toast.error(message, config);
      break;
    case 'warning':
      toast.warning(message, config);
      break;
    case 'info':
    default:
      toast.info(message, config);
      break;
  }
}

/**
 * Show success toast
 */
export function showSuccess(message: string, options?: ToastOptions) {
  showToast(message, 'success', options);
}

/**
 * Show error toast
 */
export function showError(message: string, options?: ToastOptions) {
  showToast(message, 'error', options);
}

/**
 * Show warning toast
 */
export function showWarning(message: string, options?: ToastOptions) {
  showToast(message, 'warning', options);
}

/**
 * Show info toast
 */
export function showInfo(message: string, options?: ToastOptions) {
  showToast(message, 'info', options);
}

