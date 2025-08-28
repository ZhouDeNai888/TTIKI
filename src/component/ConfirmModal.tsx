"use client";
import React, { useEffect } from "react";

type ConfirmType = "warning" | "info" | "danger";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  type?: ConfirmType;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  // optional timeline/countdown display: remaining seconds and total duration
  remainingSeconds?: number;
  durationSeconds?: number;
  // continuous animation start timestamp in ms (Date.now()) and durationSeconds used to animate smoothly
  startTimestampMs?: number | null;
};

export default function ConfirmModal({
  open,
  title,
  message,
  type = "warning",
  onConfirm,
  onCancel,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  remainingSeconds,
  durationSeconds,
  startTimestampMs,
}: Props) {
  const [smoothScale, setSmoothScale] = React.useState<number | null>(null);

  // If startTimestampMs is provided, drive a continuous animation using rAF
  useEffect(() => {
    if (!open || !startTimestampMs || !durationSeconds) {
      setSmoothScale(null);
      return;
    }
    let rafId: number | null = null;
    const end = startTimestampMs + durationSeconds * 1000;
    const tick = () => {
      const now = Date.now();
      const remainingMs = Math.max(0, end - now);
      const frac = remainingMs / Math.max(1, durationSeconds * 1000);
      setSmoothScale(frac);
      if (remainingMs > 0) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      setSmoothScale(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, startTimestampMs, durationSeconds]);
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  const bg =
    type === "danger"
      ? "bg-red-50"
      : type === "info"
      ? "bg-blue-50"
      : "bg-yellow-50";
  const text =
    type === "danger"
      ? "text-red-700"
      : type === "info"
      ? "text-blue-700"
      : "text-yellow-700";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      {/* optional timeline bar will be rendered inside modal content */}
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative max-w-md w-full mx-auto">
        <div
          className={`rounded-xl shadow-lg p-6 ${bg} dark:bg-gray-800 border border-gray-100 dark:border-gray-700`}
        >
          {title && (
            <div className={`font-semibold ${text} text-lg mb-2`}>{title}</div>
          )}
          {typeof durationSeconds !== "undefined" && (
            <div className="w-full mb-3">
              <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-inner">
                {/* Prefer smoothScale (rAF) when available, otherwise fall back to per-second scale */}
                <div
                  className={`h-2 bg-gradient-to-r from-red-500 to-red-400 origin-left`}
                  style={{
                    transform: `scaleX(${Math.max(
                      0,
                      smoothScale ??
                        Math.max(
                          0,
                          (remainingSeconds ?? durationSeconds) /
                            Math.max(1, durationSeconds)
                        )
                    )})`,
                    transformOrigin: "left",
                    transition:
                      smoothScale === null
                        ? "transform 900ms linear"
                        : undefined,
                    willChange: "transform",
                  }}
                  aria-hidden
                />
              </div>
            </div>
          )}
          <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            {message}
          </div>
          <div className="mt-6 flex justify-end items-center gap-2">
            <button
              onClick={onCancel}
              className="cursor-pointer px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-medium hover:brightness-95"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`cursor-pointer px-4 py-2 rounded-md font-medium text-white ${
                type === "danger"
                  ? "bg-red-600 hover:bg-red-700"
                  : type === "info"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
