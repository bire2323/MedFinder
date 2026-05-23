import React from "react";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone = "danger",
  loading = false,
  onConfirm,
  onClose,
}) {
  const toneClass =
    confirmTone === "primary"
      ? "bg-blue-600 hover:bg-blue-700"
      : confirmTone === "success"
        ? "bg-emerald-600 hover:bg-emerald-700"
        : "bg-red-600 hover:bg-red-700";

  return (
    <Modal
      open={open}
      title={title}
      onClose={loading ? undefined : onClose}
      maxWidthClassName="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${toneClass}`}
          >
            {loading ? <LoadingSpinner size={16} className="border-white" /> : null}
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="text-sm text-gray-700 dark:text-gray-200">{message}</div>
    </Modal>
  );
}

