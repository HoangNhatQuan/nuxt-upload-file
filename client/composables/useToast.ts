export interface ToastOptions {
  timeout?: number;
  color?: string;
  icon?: string;
}

export interface IToastService {
  success(message: string, options?: ToastOptions): void;
  error(message: string, options?: ToastOptions): void;
  warning(message: string, options?: ToastOptions): void;
  info(message: string, options?: ToastOptions): void;
}

export function useToast(): IToastService {
  if (typeof window !== "undefined" && (window as any).$nuxt) {
    const $toast = (window as any).$nuxt.$toast as IToastService;
    if ($toast) {
      return $toast;
    }
  }

  // Fallback implementation if toast service is not available
  return {
    success: (message: string) => console.log("SUCCESS:", message),
    error: (message: string) => console.error("ERROR:", message),
    warning: (message: string) => console.warn("WARNING:", message),
    info: (message: string) => console.info("INFO:", message),
  };
}
