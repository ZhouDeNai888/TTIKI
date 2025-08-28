"use client";
import React from "react";

type Props = {
  status: string | null;
  onConfirm: () => void;
};

export default function PaidSuccessModal({ status, onConfirm }: Props) {
  const isSuccess =
    status === "paid" || status === "successful" || status === "paid";
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-md w-full">
        <div
          className={`text-3xl font-extrabold mb-2 ${
            isSuccess
              ? "text-green-600 dark:text-green-400"
              : "text-yellow-600 dark:text-yellow-400"
          }`}
        >
          {isSuccess ? "ชำระเงินสำเร็จ" : "สถานะการชำระเงิน"}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          สถานะ: {status}
        </div>
        <button
          onClick={onConfirm}
          className="cursor-pointer px-6 py-2 bg-green-600 text-white rounded-md font-bold hover:bg-green-700 transition"
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}
