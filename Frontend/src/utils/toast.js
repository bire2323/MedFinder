import toast from "react-hot-toast";

export function toastSuccess(message) {
  toast.success(message);
}

export function toastError(message) {
  toast.error(message);
}

export default { toastSuccess, toastError };

