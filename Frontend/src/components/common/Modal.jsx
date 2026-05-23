import React, { useEffect } from "react";

export default function Modal({
  open,
  title,
  children,
  footer,
  onClose,
  maxWidthClassName = "max-w-lg",
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close modal overlay"
      />
      <div className={`relative w-full ${maxWidthClassName} px-4`}>
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
          {title ? (
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
          ) : null}
          <div className="px-5 py-4">{children}</div>
          {footer ? (
            <div className="border-t border-gray-200 px-5 py-4 dark:border-gray-700">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

