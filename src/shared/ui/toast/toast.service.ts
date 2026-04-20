import toast from "react-hot-toast";

export const toastService = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  loading: (msg: string) => toast.loading(msg),

  networkError: () => toast.error("Internet disconnected"),
  unknownError: () => toast.error("Something went wrong"),

  dismiss: toast.dismiss,
};
