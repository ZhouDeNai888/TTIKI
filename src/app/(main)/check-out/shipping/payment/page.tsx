"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";

export default function PaymentPage() {
  const { language } = useLanguage();
  const t = translations[language].checkout;
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("card");
  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [error, setError] = useState("");

  // detect card brand from entered card number (simple prefix checks)
  function getCardBrand(num: string): string | null {
    const digits = num.replace(/\s+/g, "");
    if (!digits) return null;
    if (/^4/.test(digits)) return "visa";
    if (/^3[47]/.test(digits)) return "amex";
    if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]\d|7[01])/.test(digits))
      return "mastercard";
    if (/^35/.test(digits)) return "jcb";
    if (/^6/.test(digits)) return "discover";
    return null;
  }

  // Prefill card info from localStorage if exists and paymentMethod is card
  useEffect(() => {
    const refresh_token = document.cookie.match(/urft=([^;]+)/);
    if (!refresh_token) {
      router.replace("/signin");
      return;
    }
    if (paymentMethod !== "card") return;
    if (typeof window !== "undefined") {
      const cardStr = localStorage.getItem("checkout_card");
      if (cardStr) {
        try {
          const cardObj = JSON.parse(cardStr);
          setCardNumber(cardObj.card_number || "");
          setCardName(cardObj.card_name || "");
          setCardExpiry(cardObj.card_expiry || "");
          setCardCvc(cardObj.card_cvc || "");
        } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod]);

  function handleNext(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (paymentMethod === "card") {
      if (!cardNumber || !cardName || !cardExpiry || !cardCvc) {
        setError("กรุณากรอกข้อมูลบัตรให้ครบถ้วน");
        return;
      }
    }
    if (typeof window !== "undefined") {
      const paymentData: any = { payment_method: paymentMethod };
      if (paymentMethod === "card") {
        // Store card info separately
        localStorage.setItem(
          "checkout_card",
          JSON.stringify({
            card_number: cardNumber,
            card_name: cardName,
            card_expiry: cardExpiry,
            card_cvc: cardCvc,
          })
        );
      } else {
        // Remove card info if switching to bank
        localStorage.removeItem("checkout_card");
      }
      localStorage.setItem("checkout_payment", JSON.stringify(paymentData));
    }
    router.push("/check-out/shipping/payment/confirm");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10 text-black dark:text-white">
      <h1 className="text-3xl font-extrabold text-red-700 dark:text-red-300 mb-8 tracking-tight drop-shadow-sm text-center">
        {t.paymentMethod || "Payment Method"}
      </h1>
      {/* Stepper */}
      <div className="w-full max-w-xl flex flex-col items-center mb-8">
        <ol className="flex w-full justify-between items-center text-sm font-bold">
          <li className="flex-1 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center mb-1">
              1
            </div>
            <span className="text-gray-700 dark:text-gray-200">
              ตรวจสอบสินค้า
            </span>
          </li>
          <li className="flex-1 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center mb-1">
              2
            </div>
            <span className="text-gray-700 dark:text-gray-200">ที่อยู่</span>
          </li>
          <li className="flex-1 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center mb-1">
              3
            </div>
            <span className="text-red-700 dark:text-red-300">การชำระเงิน</span>
          </li>
          <li className="flex-1 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center mb-1">
              4
            </div>
            <span className="text-gray-700 dark:text-gray-200">
              ยืนยันการชำระเงิน
            </span>
          </li>
        </ol>
        <div className="w-full h-1 bg-red-100 dark:bg-gray-800 mt-2 mb-2 relative">
          <div
            className="absolute left-0 top-0 h-1 bg-red-600"
            style={{ width: "75%" }}
          />
        </div>
      </div>
      <form
        className="w-full max-w-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-red-100 dark:border-gray-800 flex flex-col gap-6"
        onSubmit={handleNext}
      >
        <div className="flex flex-col gap-4">
          <label className="font-bold">เลือกช่องทางชำระเงิน</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="card">บัตรเครดิต/เดบิต</option>
            <option value="promptpay">Promt pay QR Code</option>
          </select>
        </div>
        {/* Card input fields if card/debit selected */}
        {paymentMethod === "card" && (
          <div className="flex flex-col gap-4 mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-red-100 dark:border-gray-700">
            <label className="font-bold">ข้อมูลบัตรเครดิต/เดบิต</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                maxLength={19}
                placeholder="หมายเลขบัตร (Card Number)"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(
                    e.target.value
                      .replace(/[^0-9]/g, "")
                      .replace(/(.{4})/g, "$1 ")
                      .trim()
                  )
                }
                className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pr-12 w-full"
              />
              {/* Brand indicator: try FontAwesome brand icon, fallback to short text */}
              {getCardBrand(cardNumber) && (
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <i
                    className={`fa-brands fa-cc-${getCardBrand(
                      cardNumber
                    )} text-2xl text-gray-400 dark:text-gray-500`}
                    aria-hidden="true"
                  />
                  <span className="ml-2 text-xs text-gray-600 dark:text-gray-400 uppercase">
                    {getCardBrand(cardNumber)}
                  </span>
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="ชื่อบนบัตร (Name on Card)"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <div className="flex gap-4">
              <input
                type="text"
                maxLength={5}
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) =>
                  setCardExpiry(
                    e.target.value
                      .replace(/[^0-9/]/g, "")
                      .replace(/(\d{2})(\d{1,2})/, "$1/$2")
                      .slice(0, 5)
                  )
                }
                className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-1/2"
              />
              <input
                type="text"
                maxLength={4}
                placeholder="CVC"
                value={cardCvc}
                onChange={(e) =>
                  setCardCvc(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))
                }
                className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-1/2"
              />
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-600 font-bold text-center mt-2">{error}</div>
        )}
        <button
          type="submit"
          className="cursor-pointer mt-8 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all duration-200"
        >
          ถัดไป
        </button>
        <button
          type="button"
          className="cursor-pointer mt-4 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold shadow hover:scale-105 transition-all duration-200"
          onClick={() => router.push("/check-out/shipping")}
        >
          ย้อนกลับ
        </button>
      </form>
    </main>
  );
}
