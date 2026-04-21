export const toastService = {
  async success(msg: string) {
    const toast = (await import("react-hot-toast")).default;

    toast.success(msg);
  },

  async error(msg: string) {
    const toast = (await import("react-hot-toast")).default;

    toast.error(msg);
  },

  async loading(msg: string) {
    const toast = (await import("react-hot-toast")).default;

    toast.loading(msg);
  },

  async networkError() {
    const toast = (await import("react-hot-toast")).default;

    toast.error("Internet disconnected");
  },

  async unknownError() {
    const toast = (await import("react-hot-toast")).default;

    toast.error("Something went wrong");
  },

  async dismiss() {
    const toast = (await import("react-hot-toast")).default;

    toast.dismiss();
  },
};
