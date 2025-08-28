"use client";
import React, { useEffect } from "react";

type AlertType = "success" | "error" | "info" | "warning" | "delete";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  type?: AlertType;
  onClose: () => void;
  // optional auto close in ms
  autoCloseMs?: number | null;
};

export default function AlertModal({
  open,
  title,
  message,
  type = "info",
  onClose,
  autoCloseMs = null,
}: Props) {
  // debug: log when modal mounts/opens
  React.useEffect(() => {
    if (open)
      console.log("AlertModal opened:", { title, message, type, autoCloseMs });
  }, [open, title, message, type, autoCloseMs]);
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !autoCloseMs) return;
    const id = setTimeout(() => onClose(), autoCloseMs);
    return () => clearTimeout(id);
  }, [open, autoCloseMs, onClose]);

  if (!open) return null;
  const colorClasses: Record<AlertType, { bg: string; text: string }> = {
    success: { bg: "bg-green-50", text: "text-green-700" },
    error: { bg: "bg-red-50", text: "text-red-700" },
    info: { bg: "bg-blue-50", text: "text-blue-700" },
    warning: { bg: "bg-yellow-50", text: "text-yellow-700" },
    delete: { bg: "bg-red-50", text: "text-red-700" },
  };

  const iconBgClasses: Record<AlertType, string> = {
    success: "bg-green-100",
    error: "bg-red-100",
    info: "bg-blue-100",
    warning: "bg-yellow-100",
    delete: "bg-red-100",
  };

  const iconClass: Record<AlertType, string> = {
    // uses Font Awesome 6 class names (add FA stylesheet to your layout)
    success: "fa-solid fa-circle-check",
    error: "fa-solid fa-circle-xmark",
    info: "fa-solid fa-circle-info",
    warning: "fa-solid fa-triangle-exclamation",
    delete: "fa-solid fa-trash",
  };

  const cls = colorClasses[type] || colorClasses.info;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "alert-modal-title" : undefined}
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative max-w-md w-full mx-auto">
        <div
          className={`rounded-xl shadow-lg p-6 ${cls.bg} dark:bg-gray-800 border border-gray-100 dark:border-gray-700`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgClasses[type]} dark:bg-opacity-20`}
              >
                <i
                  className={`${iconClass[type]} ${cls.text} text-xl`}
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {title && (
                <div
                  id="alert-modal-title"
                  className={`font-semibold ${cls.text} text-lg`}
                >
                  {title}
                </div>
              )}
              <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {message}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end items-center gap-2">
            <button
              onClick={onClose}
              className="cursor-pointer px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-medium hover:brightness-95 flex items-center gap-2"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
              <span>ปิด</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
