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
  if (typeof window !== "undefined") {
    if ((window as any).$nuxt && (window as any).$nuxt.$toast) {
      return (window as any).$nuxt.$toast as IToastService;
    }
    
    if ((window as any).Vue && (window as any).Vue.prototype.$toast) {
      return (window as any).Vue.prototype.$toast as IToastService;
    }
  }

  return {
    success: (message: string, options?: ToastOptions) => {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("Success", { body: message });
      }
    },
    error: (message: string, options?: ToastOptions) => {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("Error", { body: message });
      }
    },
    warning: (message: string, options?: ToastOptions) => {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("Warning", { body: message });
      }
    },
    info: (message: string, options?: ToastOptions) => {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("Info", { body: message });
      }
    },
  };
}
