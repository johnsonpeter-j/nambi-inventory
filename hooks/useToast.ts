import { toast, ToastOptions } from "react-toastify";

interface ToastConfig extends ToastOptions {
  message: string;
}

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
};

export const useToast = () => {
  const showToast = (
    type: "success" | "error" | "info" | "warning",
    message: string,
    options?: ToastOptions
  ) => {
    const toastOptions: ToastOptions = {
      ...defaultOptions,
      ...options,
    };

    switch (type) {
      case "success":
        toast.success(message, toastOptions);
        break;
      case "error":
        toast.error(message, toastOptions);
        break;
      case "info":
        toast.info(message, toastOptions);
        break;
      case "warning":
        toast.warning(message, toastOptions);
        break;
    }
  };

  const success = (message: string, options?: ToastOptions) => {
    showToast("success", message, options);
  };

  const error = (message: string, options?: ToastOptions) => {
    showToast("error", message, options);
  };

  const info = (message: string, options?: ToastOptions) => {
    showToast("info", message, options);
  };

  const warning = (message: string, options?: ToastOptions) => {
    showToast("warning", message, options);
  };

  return {
    success,
    error,
    info,
    warning,
    showToast,
  };
};





