"use client";
import React, { useEffect, useState } from "react";
import PaidSuccessModal from "@/component/PaidSuccessModal";
import ApiService from "@/utils/ApiService";

type Props = {
  qrUrl: string;
  chargeId?: string | null;
  downloadName?: string;
  onClose: () => void;
  // optional override (ms) — defaults to 10 minutes
  ttlMs?: number;
  orderId?: string | null; // optional order ID for tracking
};

export default function PromptPayModal({
  qrUrl,
  chargeId = null,
  downloadName = "promptpay-qr.png",
  onClose,
  ttlMs = 10 * 60 * 1000,
  orderId = null,
}: Props) {
  const [remainingMs, setRemainingMs] = useState<number>(ttlMs);
  const [polling, setPolling] = useState<boolean>(false);
  const [resultStatus, setResultStatus] = useState<string | null>(null);

  useEffect(() => {
    // reset timer when qrUrl changes
    setRemainingMs(ttlMs);

    const start = Date.now();
    const timeoutId = setTimeout(() => {
      onClose();
    }, ttlMs);

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - start;
      const remain = Math.max(ttlMs - elapsed, 0);
      setRemainingMs(remain);
      if (remain === 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [qrUrl, ttlMs, onClose]);

  // Poll charge status every 10s when chargeId is available
  useEffect(() => {
    if (!chargeId) return;
    let mounted = true;
    const checkOnce = async () => {
      try {
        const res = await fetch(
          `/api/omise/charge-status?charge_id=${encodeURIComponent(chargeId)}`
        );
        const json = await res.json();
        if (json.success && json.data) {
          const charge = json.data.charge || json.data;
          // Prefer the nested source.charge_status (PromptPay)
          const sourceChargeStatus =
            charge &&
            (charge.source?.charge_status ||
              charge._attributes?.source?.charge_status ||
              null);
          // top-level fallback
          const topStatus =
            charge && (charge.status || (charge.paid ? "paid" : undefined));

          // If sourceChargeStatus exists and it's not 'pending', set result
          if (sourceChargeStatus && sourceChargeStatus !== "pending") {
            if (mounted) setResultStatus(sourceChargeStatus);
            // persist payment status to backend if orderId provided (best-effort)
            if (orderId) {
              try {
                const numericOrderId = Number(orderId);
                if (!Number.isNaN(numericOrderId)) {
                  await ApiService.updatePaymentStatusByOrder(numericOrderId);
                }
              } catch (err) {
                // ignore persistence errors, we'll still show modal
              }
            }

            return;
          }

          if (
            topStatus &&
            ["successful", "paid", "failed", "expired"].includes(topStatus)
          ) {
            if (mounted) setResultStatus(topStatus);
            // persist payment status to backend if orderId provided (best-effort)
            if (orderId) {
              try {
                const numericOrderId = Number(orderId);
                if (!Number.isNaN(numericOrderId)) {
                  await ApiService.updatePaymentStatusByOrder(numericOrderId);
                }
              } catch (err) {
                // ignore persistence errors
              }
            }
          }
        }
      } catch (e) {
        // ignore and retry on next interval
      }
    };

    // initial check
    checkOnce();
    const id = setInterval(() => {
      checkOnce();
    }, 5_000);
    setPolling(true);
    return () => {
      mounted = false;
      clearInterval(id);
      setPolling(false);
    };
  }, [chargeId, orderId]);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000)
    .toString()
    .padStart(2, "0");

  const progress = Math.max(
    0,
    Math.min(100, Math.round((remainingMs / ttlMs) * 100))
  );

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-200 scale-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <i className="fa-solid fa-qrcode text-lg" aria-hidden="true" />
              </div>
              <div>
                <div className="font-semibold text-gray-800 dark:text-gray-100">
                  PromptPay QR
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  แสดง QR เพื่อชำระเงิน
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="close"
              className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <img
                  src={qrUrl}
                  alt="PromptPay QR Code"
                  className="w-64 h-64 object-contain"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    QR นี้จะหมดอายุใน
                  </div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                    {minutes}:{seconds}
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden mb-4">
                    <div
                      className="h-2 bg-red-500 dark:bg-red-400 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    โปรดสแกน QR โดยใช้แอป PromptPay หรือธนาคารของคุณ
                    <h3 className="mt-2 font-bold text-red-600 dark:text-red-400">
                      *กรุณาอย่าออกจากหน้านี้จนกว่าการชำระเงินจะเสร็จสมบูรณ์*
                    </h3>
                    <div className="mt-2 text-xs text-red-500 dark:text-red-400 font-semibold">
                      **เมื่อชำระเงินสำเร็จ กรุณารอซักครู่
                      ระบบจะอัปเดตสถานะโดยอัตโนมัติ**
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {resultStatus && (
        <PaidSuccessModal
          status={resultStatus}
          onConfirm={() => {
            // Close parent modal as well
            onClose();
          }}
        />
      )}
    </>
  );
}
