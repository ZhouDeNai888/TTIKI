"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";
import ApiService from "@/utils/ApiService";
import PromptPayModal from "@/component/PromptPayModal";
import PaidSuccessModal from "@/component/PaidSuccessModal";
import AlertModal from "@/component/AlertModal";
import ConfirmModal from "@/component/ConfirmModal";

// Types
type CartItem = {
  id?: string | number;
  item_code: string;
  item_name: string;
  img?: string;
  quantity: number;
  price: number;
};
type ShippingAddress = {
  first_name: string;
  last_name: string;
  phone_number: string;
  address_line1: string;
  address_line2?: string;
  sub_district: string;
  district: string;
  province: string;
  postal_code: string;
  country: string;
};
type PaymentInfo = {
  payment_method: string;
  amount: number;
};

type CardInfo = {
  card_number: string;
  card_name: string;
  card_expiry: string;
  card_cvc: string;
};

export default function ConfirmPage() {
  const { language } = useLanguage();
  const t = translations[language].checkout;
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[] | null>(null);
  // Calculate subtotal, tax, total
  const subtotal = (cart ?? []).reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );
  const tax = +(subtotal * 0.07).toFixed(2);
  // Shipping is included in total; currently free (0)
  const shippingCost = 0;
  const total = +(subtotal + tax + shippingCost).toFixed(2);
  const [shipping, setShipping] = useState<ShippingAddress | null>(null);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cardInfo, setCardInfo] = useState<CardInfo | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);
  const [qrChargeId, setQrChargeId] = useState<string | null>(null);
  const [qrOrderId, setQrOrderId] = useState<string | null>(null);
  const [paidResultStatus, setPaidResultStatus] = useState<string | null>(null);
  // Confirm modal state for checkout confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [countdown, setCountdown] = useState<number>(10);
  const countdownRef = React.useRef<number | null>(null);
  const [confirmStartTs, setConfirmStartTs] = useState<number | null>(null);
  // guard to avoid double submission when manual confirm and auto-confirm race
  const submittingRef = React.useRef<boolean>(false);

  // Start countdown when confirm modal opens. Auto-confirm when reaches 0.
  useEffect(() => {
    const refresh_token = document.cookie.match(/urft=([^;]+)/);
    if (!refresh_token) {
      router.replace("/signin");
      return;
    }
    if (!confirmOpen) return;
    // ensure countdown starts at current value
    if (countdownRef.current) {
      window.clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    countdownRef.current = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          // time up: stop timer and auto-confirm
          if (countdownRef.current) {
            window.clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          setConfirmOpen(false);
          // call handleConfirm asynchronously, avoid double-submit
          if (!submittingRef.current) {
            submittingRef.current = true;
            (async () => {
              try {
                await handleConfirm();
              } catch (e) {
                console.error("auto-confirm failed", e);
              } finally {
                submittingRef.current = false;
              }
            })();
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmOpen]);
  // Alert modal state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState<string | undefined>(undefined);
  const [alertType, setAlertType] = useState<
    "success" | "error" | "info" | "warning" | "delete"
  >("info");
  const [alertAutoCloseMs, setAlertAutoCloseMs] = useState<number | null>(4000);

  function showAlert(
    message: string,
    type: "success" | "error" | "info" | "warning" | "delete" = "info",
    title?: string,
    autoCloseMs?: number | null
  ) {
    setAlertMessage(message);
    setAlertType(type);
    setAlertTitle(title);
    setAlertAutoCloseMs(
      typeof autoCloseMs === "undefined" ? 4000 : autoCloseMs ?? null
    );
    setAlertOpen(true);
  }
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.omise.co/omise.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Optional: load FontAwesome CSS for richer icon options (safe fallback: we also use inline SVGs)
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("fa-css")) return;
    const link = document.createElement("link");
    link.id = "fa-css";
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    async function fetchCartWithPrices() {
      if (typeof window === "undefined") return;
      try {
        const cartStr = localStorage.getItem("checkout");
        const shippingStr = localStorage.getItem("checkout_shipping");
        const paymentStr = localStorage.getItem("checkout_payment");
        const cardStr = localStorage.getItem("checkout_card");
        const cartLocal: CartItem[] = cartStr ? JSON.parse(cartStr) : [];
        setShipping(shippingStr ? JSON.parse(shippingStr) : null);
        setPayment(paymentStr ? JSON.parse(paymentStr) : null);
        setCardInfo(cardStr ? JSON.parse(cardStr) : null);

        // Get item codes
        const itemcode = cartLocal.map((item) => item.item_code);
        // Fetch prices from backend
        const res = await ApiService.getCartItemsPost({ itemcode });
        if (res.success && Array.isArray(res.data)) {
          // Merge backend prices into cart
          const backendItems = res.data;
          const mergedCart = cartLocal.map((item) => {
            const backend = backendItems.find(
              (b: any) => b.item_code === item.item_code
            );
            return backend ? { ...item, price: backend.price } : item;
          });
          setCart(mergedCart);
        } else {
          setCart(cartLocal);
        }
      } catch {
        setCart([]);
      } finally {
        setInitialLoading(false);
      }
    }
    fetchCartWithPrices();
  }, []);

  async function handleConfirm() {
    setLoading(true);
    setError("");
    const month = cardInfo?.card_expiry
      ? cardInfo.card_expiry.split("/")[0].trim()
      : "12";
    // Extract full year from card_expiry (MM/YY or MM/YYYY)
    let year = new Date().getFullYear() + 1;
    if (cardInfo?.card_expiry) {
      const parts = cardInfo.card_expiry.split("/");
      if (parts[1]) {
        let y = parts[1].trim();
        if (y.length === 2) {
          // Assume 20xx for 2-digit year
          year = 2000 + parseInt(y, 10);
        } else if (y.length === 4) {
          year = parseInt(y, 10);
        }
      }
    }

    const items = (cart ?? []).map((item) => ({
      item_code: item.item_code,
      quantity: item.quantity,
      unit_price: item.price,
    }));
    // Human-readable items detail for backend/notifications
    const itemsDetail = (cart ?? [])
      .map((item) => {
        const name = item.item_name ?? item.item_code;
        const qty = item.quantity ?? 0;
        const price =
          typeof item.price !== "undefined"
            ? `฿${Number(item.price).toLocaleString()}`
            : "฿0";
        return `${name} x ${qty} (${price}) = ฿${(
          item.price * qty
        ).toLocaleString()}`;
      })
      .join("\n");
    // Always use payment_method from localStorage, and set amount = total
    let payment_method = "";
    if (typeof window !== "undefined") {
      const paymentStr = localStorage.getItem("checkout_payment");
      if (paymentStr) {
        try {
          const paymentObj = JSON.parse(paymentStr);
          payment_method = paymentObj.payment_method;
        } catch {}
      }
    }
    const paymentPayload = {
      payment_method,
      amount: total,
    };
    const payload = {
      items,
      shipping_address: shipping as ShippingAddress,
      payment: paymentPayload,
      note: itemsDetail,
    };
    try {
      const res = await ApiService.checkout(payload);

      if (res.success) {
        // @ts-ignore
        Omise.setPublicKey(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY);

        if (payment_method === "card") {
          // @ts-ignore
          Omise.createToken(
            payment_method,
            {
              name: cardInfo?.card_name,
              number: cardInfo?.card_number,
              expiration_month: month,
              expiration_year: year,
              security_code: cardInfo?.card_cvc,
            },
            async (statusCode: number, response: any) => {
              if (statusCode === 200) {
                // ส่ง token ไป backend
                const resCharge = await ApiService.charge({
                  token: response.id,
                  order_id: res.data.order_id,
                  amount: total,
                });
                // show paid-success modal immediately with status 'successful'
                setPaidResultStatus("successful");
              } else {
                showAlert(
                  "ไม่สามารถสร้าง token ได้: " + response.message,
                  "error",
                  "Error",
                  null
                );
                return;
              }
            }
          );
        } else if (payment_method === "promptpay") {
          // Omise PromptPay: createSource, then show QR code
          // @ts-ignore
          Omise.createSource(
            "promptpay",
            {
              amount: Math.round(total * 100), // Omise expects amount in satang
              currency: "thb",
            },
            async (statusCode: number, response: any) => {
              if (statusCode === 200 && response.type === "promptpay") {
                // response.scannable_code.image.download_uri is the QR code image URL

                // Optionally, send source id to backend for further processing
                const resCharge = await ApiService.charge({
                  token: response.id, // source id
                  order_id: res.data.order_id,
                  amount: total,
                });

                // Show QR code to user (simple window for now)
                // Show QR code in a modal instead of window.open
                // ApiService.charge should return the created charge in resCharge.data.charge
                const qrUrl =
                  resCharge.data?.charge?._attributes?.source?.scannable_code
                    ?.image?.download_uri;
                // Try to get charge id from response (may be chrg_...)
                const chargeId =
                  resCharge.data?.charge?.id ||
                  resCharge.data?.charge?._attributes?.id ||
                  resCharge.data?.charge_id ||
                  null;
                if (qrUrl) {
                  setQrModalUrl(qrUrl);
                  setQrChargeId(chargeId);
                  // store order id so the QR modal can use it for status checks if needed
                  setQrOrderId(res.data?.order_id || null);
                } else {
                  localStorage.removeItem("checkout");
                  localStorage.removeItem("checkout_shipping");
                  localStorage.removeItem("checkout_payment");
                  localStorage.removeItem("checkout_card");
                  localStorage.removeItem("cart");
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("cartUpdated"));
                  }
                  router.replace("/orders");
                }
              } else {
                showAlert(
                  "ไม่สามารถสร้าง QR Code ได้: " + response.message,
                  "error",
                  "Error",
                  null
                );
                return;
              }
            }
          );
        } else {
          setError("ไม่รองรับช่องทางชำระเงินนี้");
        }
      } else {
        setError(res.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } catch (err) {
      setError(`เกิดข้อผิดพลาด กรุณาลองใหม่`);
    } finally {
      setLoading(false);
    }
  }

  // ...existing code...

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10 text-black dark:text-white">
      <h1 className="text-3xl font-extrabold text-red-700 dark:text-red-300 mb-8 tracking-tight drop-shadow-sm text-center">
        {"ยืนยันคำสั่งซื้อ"}
      </h1>
      {/* Stepper */}
      <div className="w-full max-w-2xl flex flex-col items-center mb-8">
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
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center mb-1">
              3
            </div>
            <span className="text-gray-700 dark:text-gray-200">
              การชำระเงิน
            </span>
          </li>
          <li className="flex-1 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center mb-1">
              4
            </div>
            <span className="text-red-700 dark:text-red-300">
              ยืนยันการชำระเงิน
            </span>
          </li>
        </ol>
        <div className="w-full h-1 bg-red-100 dark:bg-gray-800 mt-2 mb-2 relative">
          <div
            className="absolute left-0 top-0 h-1 bg-red-600"
            style={{ width: "100%" }}
          />
        </div>
      </div>
      <div className="w-full max-w-7xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-red-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left: Order summary (spans 2 columns on md+) */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4">
            {t.orderSummary || "สรุปรายการสินค้า"}
          </h2>
          {initialLoading || cart === null ? (
            <div className="animate-pulse">
              <div className="space-y-4 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                  </div>
                ))}
              </div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-6" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-6" />
            </div>
          ) : (
            <>
              <ul className="divide-y divide-red-100 dark:divide-gray-800">
                {cart.map((item, idx) => (
                  <li
                    key={item.id || idx}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.img || "/Logo.png"}
                        alt={item.item_name || "Product"}
                        className="h-12 w-12 object-contain rounded-lg border border-red-100 dark:border-gray-700 bg-white dark:bg-gray-900"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-gray-700 dark:text-gray-300 truncate">
                          {item.item_name}
                        </span>
                        <span className="text-xs text-gray-400">
                          จำนวน: {item.quantity}
                        </span>
                        <span className="text-xs text-gray-400">
                          ราคาต่อชิ้น: ฿{item.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-red-700 dark:text-red-300">
                        รวม: ฿{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              {/* Total summary */}
              <div className="flex flex-col gap-1 mt-4 text-right">
                <div className="flex justify-end gap-4 text-base">
                  <span className="text-gray-500">ยอดรวม</span>
                  <span className="font-bold">
                    ฿{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-end gap-4 text-base">
                  <span className="text-gray-500">ภาษี (7%)</span>
                  <span className="font-bold">฿{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-end gap-4 text-base">
                  <span className="text-gray-500">ค่าส่ง</span>
                  <span className="font-bold text-green-600">ฟรี</span>
                </div>
                <div className="flex justify-end gap-4 text-lg mt-1">
                  <span className="text-red-700 dark:text-red-300 font-bold">
                    ยอดสุทธิ
                  </span>
                  <span className="font-extrabold text-red-700 dark:text-red-300 text-xl">
                    ฿{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: Shipping + Payment + actions */}
        <aside className="md:col-span-2 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4">
              {t.shippingAddress || "ที่อยู่จัดส่ง"}
            </h2>
            <div className="rounded-lg p-4 text-sm">
              {shipping ? (
                <div className="bg-white dark:bg-[#071022] rounded-lg p-4 shadow-md border border-red-100 dark:border-gray-700 flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-gray-800 flex items-center justify-center text-red-600">
                      <i
                        className="fa-solid fa-location-dot text-red-600 text-lg"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-100">
                          {shipping.first_name} {shipping.last_name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {shipping.phone_number}
                        </div>
                      </div>
                      <div>
                        <button
                          className="cursor-pointer px-3 py-1 text-sm rounded border border-gray-200 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => router.push("/check-out/shipping")}
                        >
                          แก้ไข
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-gray-600 dark:text-gray-300 text-sm">
                      <div>
                        {shipping.address_line1} {shipping.address_line2}
                      </div>
                      <div>
                        {shipping.sub_district}, {shipping.district},{" "}
                        {shipping.province} {shipping.postal_code}
                      </div>
                      <div className="mt-1">{shipping.country}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-red-500">ไม่พบข้อมูลที่อยู่จัดส่ง</div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4">
              {t.paymentMethod || "ช่องทางชำระเงิน"}
            </h2>
            <div className="rounded-lg p-4 text-sm">
              {payment ? (
                <div className="bg-white dark:bg-[#071022] rounded-lg p-4 shadow-md border border-red-100 dark:border-gray-700 flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-gray-800 flex items-center justify-center text-red-600">
                      {payment.payment_method === "card" ? (
                        <i
                          className="fa-solid fa-credit-card text-red-600 text-lg"
                          aria-hidden="true"
                        />
                      ) : (
                        <i
                          className="fa-solid fa-qrcode text-red-600 text-lg"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-100">
                          {payment.payment_method === "card"
                            ? "บัตรเครดิต/เดบิต"
                            : payment.payment_method === "promptpay"
                            ? "พร้อมเพลย์ (QR)"
                            : "-"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ยอดที่ต้องชำระ: ฿{total.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <button
                          className="cursor-pointer px-3 py-1 text-sm rounded border border-gray-200 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() =>
                            router.push("/check-out/shipping/payment")
                          }
                        >
                          แก้ไข
                        </button>
                      </div>
                    </div>
                    {payment.payment_method === "card" && cardInfo && (
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                        <div>
                          หมายเลขบัตร: **** **** ****{" "}
                          {cardInfo.card_number?.slice(-4)}
                        </div>
                        <div>ชื่อบนบัตร: {cardInfo.card_name}</div>
                        <div>วันหมดอายุ: {cardInfo.card_expiry}</div>
                      </div>
                    )}
                    {payment.payment_method === "promptpay" && (
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                        แสดง QR เมื่อกด "ยืนยันคำสั่งซื้อ" เพื่อชำระผ่าน
                        PromptPay
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-red-500">ไม่พบข้อมูลการชำระเงิน</div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-600 font-bold text-center">{error}</div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-2 justify-end mr-4">
            <button
              type="button"
              disabled={loading}
              onClick={() => router.push("/check-out/shipping/payment")}
              className="cursor-pointer w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-white rounded-xl font-bold shadow hover:scale-105 transition-all duration-200 border border-gray-300 dark:border-gray-600"
            >
              ย้อนกลับ
            </button>
            <button
              disabled={loading}
              onClick={() => {
                // open confirm modal and start countdown
                const now = Date.now();
                setCountdown(10);
                setConfirmStartTs(now);
                setConfirmOpen(true);
              }}
              className="cursor-pointer w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all duration-200"
            >
              {loading ? "กำลังส่งข้อมูล..." : "ยืนยันคำสั่งซื้อ"}
            </button>
          </div>
        </aside>
      </div>
      {qrModalUrl && (
        <PromptPayModal
          qrUrl={qrModalUrl}
          chargeId={qrChargeId}
          orderId={qrOrderId}
          onClose={() => {
            setQrModalUrl(null);
            setQrChargeId(null);
            setQrOrderId(null);
            localStorage.removeItem("checkout");
            localStorage.removeItem("checkout_shipping");
            localStorage.removeItem("checkout_payment");
            localStorage.removeItem("checkout_card");
            localStorage.removeItem("cart");
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("cartUpdated"));
            }
            router.replace("/orders");
          }}
        />
      )}
      {paidResultStatus && (
        <PaidSuccessModal
          status={paidResultStatus}
          onConfirm={() => {
            setPaidResultStatus(null);
            localStorage.removeItem("checkout");
            localStorage.removeItem("checkout_shipping");
            localStorage.removeItem("checkout_payment");
            localStorage.removeItem("checkout_card");
            localStorage.removeItem("cart");
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("cartUpdated"));
            }
            router.replace("/orders");
          }}
        />
      )}
      <AlertModal
        open={alertOpen}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        autoCloseMs={alertAutoCloseMs}
        onClose={() => setAlertOpen(false)}
      />
      <ConfirmModal
        open={confirmOpen}
        title="ยืนยันคำสั่งซื้อ"
        message={`คุณแน่ใจหรือไม่ ว่าต้องการยืนยันคำสั่งซื้อ? (ยืนยันภายใน ${countdown} วินาที)`}
        type="warning"
        confirmLabel="ยืนยัน"
        cancelLabel="ยกเลิก"
        remainingSeconds={countdown}
        durationSeconds={10}
        startTimestampMs={confirmStartTs}
        onCancel={() => {
          // stop countdown and close
          if (countdownRef.current) {
            window.clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          setConfirmOpen(false);
        }}
        onConfirm={async () => {
          // stop countdown, close modal and perform confirm
          if (countdownRef.current) {
            window.clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          setConfirmOpen(false);
          if (!submittingRef.current) {
            submittingRef.current = true;
            try {
              await handleConfirm();
            } finally {
              submittingRef.current = false;
            }
          }
        }}
      />
    </main>
  );
}
