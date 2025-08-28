"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";
import Link from "next/link";

import ApiService, { OrderIdRequest } from "@/utils/ApiService";
import PromptPayModal from "@/component/PromptPayModal";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.order_id;

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Ratings state: keys are stringified item ids or item codes
  const [ratings, setRatings] = useState<Record<string, number>>({});
  // sending state when persisting ratings
  const [sendingRatings, setSendingRatings] = useState<Record<string, boolean>>(
    {}
  );

  const handleRate = async (
    itemId: number | string,
    value: number,
    itemCode?: string
  ) => {
    const key = String(itemId);
    const prev = ratings[key] || 0;

    // optimistic update
    setRatings((prevS) => ({ ...prevS, [key]: value }));
    setSendingRatings((s) => ({ ...s, [key]: true }));

    try {
      // determine item_code to send to backend
      const item_code =
        itemCode ?? (typeof itemId === "string" ? String(itemId) : undefined);
      const payload: any = { rating: value };
      if (item_code) payload.item_code = item_code;
      if (orderId)
        payload.order_id = Number(
          Array.isArray(orderId) ? orderId[0] : orderId
        );

      if (ApiService && typeof ApiService.upsertItemRating === "function") {
        const res = await ApiService.upsertItemRating(payload);
        // If backend returns canonical rating value, use it
        const returned =
          res?.data?.rating ??
          res?.data?.rating_value ??
          res?.data?.value ??
          null;
        if (res.success && returned != null) {
          setRatings((prevS) => ({ ...prevS, [key]: Number(returned) }));
          // merge into orderData.item_reviews so UI shows persisted value
          try {
            const resolvedItemCode =
              itemCode ??
              (itemId !== undefined && itemId !== null
                ? String(itemId)
                : undefined);
            setOrderData((od: any) => {
              if (!od) return od;
              const reviews = { ...(od.item_reviews || {}) };
              if (resolvedItemCode) {
                reviews[resolvedItemCode] = {
                  ...(reviews[resolvedItemCode] || {}),
                  rating: Number(returned),
                };
              }
              return { ...od, item_reviews: reviews };
            });
          } catch (e) {
            // ignore
          }
        } else {
          // Keep optimistic value if no returned rating
        }
      } else {
        console.warn(
          "ApiService.upsertItemRating not available, rating kept locally"
        );
      }
    } catch (err) {
      console.error("Failed to save rating", err);
      // revert to previous value
      setRatings((prevS) => ({ ...prevS, [key]: prev }));
    } finally {
      setSendingRatings((s) => ({ ...s, [key]: false }));
    }
  };
  // Per-item comments (local UI state)
  const [comments, setComments] = useState<Record<string, string>>({});
  const handleCommentChange = (key: string, value: string) => {
    setComments((prev) => ({ ...prev, [key]: value }));
  };
  // Sending state for comments
  const [sendingComments, setSendingComments] = useState<
    Record<string, boolean>
  >({});
  const [sentComments, setSentComments] = useState<Record<string, boolean>>({});

  const handleSendComment = async (key: string, item: any) => {
    try {
      setSendingComments((s) => ({ ...s, [key]: true }));

      const payload: any = {
        item_code: item.item_code || key,
        comment: comments[key] || "",
      };
      if (orderId)
        payload.order_id = Number(
          Array.isArray(orderId) ? orderId[0] : orderId
        );

      // Try server-side upsert first
      if (ApiService && typeof ApiService.upsertItemComment === "function") {
        const res = await ApiService.upsertItemComment(payload);
        if (res.success) {
          setSentComments((s) => ({ ...s, [key]: true }));
          // merge saved comment into orderData.item_reviews so UI shows server comment
          try {
            const item_code = payload.item_code;
            setOrderData((od: any) => {
              if (!od) return od;
              const reviews = { ...(od.item_reviews || {}) };
              if (item_code) {
                reviews[item_code] = {
                  ...(reviews[item_code] || {}),
                  comment: payload.comment,
                };
              }
              return { ...od, item_reviews: reviews };
            });
          } catch (e) {
            // ignore
          }
        } else {
          // fallback to localStorage if server returns failure
          console.warn("upsertItemComment failed, saving locally", res.message);
          const storageKey = `order-${
            Array.isArray(orderId) ? orderId[0] : orderId
          }-comments`;
          const existing = JSON.parse(localStorage.getItem(storageKey) || "{}");
          existing[key] = {
            comment: comments[key] || "",
            rating: ratings[item.order_item_id || item.item_code] || null,
            sent_at: new Date().toISOString(),
          };
          localStorage.setItem(storageKey, JSON.stringify(existing));
          setSentComments((s) => ({ ...s, [key]: true }));
        }
      } else {
        // Persist comment locally if API not available
        const storageKey = `order-${
          Array.isArray(orderId) ? orderId[0] : orderId
        }-comments`;
        const existing = JSON.parse(localStorage.getItem(storageKey) || "{}");
        existing[key] = {
          comment: comments[key] || "",
          rating: ratings[item.order_item_id || item.item_code] || null,
          sent_at: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(existing));
        setSentComments((s) => ({ ...s, [key]: true }));
      }
    } catch (err) {
      console.error("Failed to save comment", err);
    } finally {
      setSendingComments((s) => ({ ...s, [key]: false }));
    }
  };
  // PromptPay modal state
  const [showPromptPay, setShowPromptPay] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [chargeId, setChargeId] = useState<string | null>(null);
  // Shipment tracking UI state
  const [expandedShipmentId, setExpandedShipmentId] = useState<number | null>(
    null
  );
  const [trackingCache, setTrackingCache] = useState<Record<string, any>>({});
  const [loadingTracking, setLoadingTracking] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    ApiService.getOrderById({
      order_id: Number(Array.isArray(orderId) ? orderId[0] : orderId),
    })
      .then((res) => {
        if (res.success && res.data) {
          setOrderData(res.data);
        } else {
          setError(res.message || "Failed to fetch order.");
        }
      })
      .catch((err) => {
        setError(err.message || "Error fetching order.");
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  // When order data loads, seed local ratings and comments from orderData.item_reviews
  useEffect(() => {
    if (!orderData) return;
    const reviews = orderData.item_reviews || {};
    const newRatings: Record<string, number> = {};
    const newComments: Record<string, string> = {};
    const itms = orderData.items || [];
    itms.forEach((item: any) => {
      const key = String(item.order_item_id || item.item_code);
      // Prefer lookup by item_code as requested
      const review =
        (item.item_code && reviews[item.item_code]) || reviews[key] || null;
      if (review) {
        if (review.rating !== undefined && review.rating !== null) {
          newRatings[key] = Number(review.rating);
        }
        if (review.comment !== undefined && review.comment !== null) {
          newComments[key] = String(review.comment);
        }
      }
    });
    if (Object.keys(newRatings).length) {
      setRatings((prev) => ({ ...prev, ...newRatings }));
    }
    if (Object.keys(newComments).length) {
      setComments((prev) => ({ ...prev, ...newComments }));
    }
  }, [orderData]);

  // Toggle shipment expansion and load tracking if needed
  const handleToggleShipment = async (shipment: any) => {
    const sid = shipment.shipment_id;
    // collapse if already open
    if (expandedShipmentId === sid) {
      setExpandedShipmentId(null);
      return;
    }

    // open and fetch tracking if not cached
    setExpandedShipmentId(sid);
    const trackingKey = String(sid);
    if (trackingCache[trackingKey]) return;

    // try to determine a tracking code
    const tracking_code = shipment.tracking_no || null;

    if (!tracking_code) {
      setTrackingCache((prev) => ({
        ...prev,
        [trackingKey]: { success: false, message: "No tracking code" },
      }));
      return;
    }

    try {
      setLoadingTracking(true);
      const res = await ApiService.trackShipment(tracking_code);
      setTrackingCache((prev) => ({ ...prev, [trackingKey]: res }));
      // For demo/fake data: if tracking fails, set a fake timeline

      // setTrackingCache((prev) => ({
      //   ...prev,
      //   [trackingKey]: {
      //     success: true,
      //     data: {
      //       states: [
      //         {
      //           datetime: "2024-06-01 09:00",
      //           status: "Shipment Created",
      //           location: "Warehouse",
      //           description: "Your package is being prepared.",
      //         },
      //         {
      //           datetime: "2024-06-02 14:30",
      //           status: "In Transit",
      //           location: "Bangkok",
      //           description: "Package is on the way.",
      //         },
      //         {
      //           datetime: "2024-06-03 16:45",
      //           status: "Delivered",
      //           location: "Customer Address",
      //           description: "Package delivered successfully.",
      //         },
      //       ],
      //     },
      //   },
      // }));
    } catch (err) {
      setTrackingCache((prev) => ({
        ...prev,
        [trackingKey]: { success: false, message: (err as any)?.message },
      }));
    } finally {
      setLoadingTracking(false);
    }
  };

  const { language } = useLanguage();
  const t = translations[language];
  const tOrdersDetails = t.ordersdetails || {};

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10 text-black dark:text-white">
        <div className="w-full max-w-5xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-red-100 dark:border-gray-800 flex flex-col gap-8 relative animate-pulse">
          <div className="flex justify-end mb-2">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-red-100 dark:border-gray-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="flex flex-col items-end justify-center min-w-[140px]">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
          <div className="mb-6">
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-red-100 dark:border-gray-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
          <div>
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="bg-red-50 dark:bg-gray-800 rounded-xl p-4 mb-4 flex flex-col gap-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }
  if (error || !orderData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500 dark:text-red-400">
          {error || "Order not found."}
        </div>
      </main>
    );
  }

  const order = orderData.order || {};
  const items = orderData.items || [];
  const shipping_address = orderData.shipping_address || {};
  const payment = orderData.payment || {};
  const shipping_status = orderData.shipping_status || order.shipping_status;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10 text-black dark:text-white">
      <div className="w-full max-w-5xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-red-100 dark:border-gray-800 flex flex-col gap-8 relative">
        <div className="flex justify-end mb-2">
          <button
            className="cursor-pointer px-5 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold shadow hover:scale-105 transition-all duration-200"
            onClick={() => router.back()}
          >
            ← {tOrdersDetails.back || (language === "th" ? "กลับ" : "Back")}
          </button>
        </div>
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-red-100 dark:border-gray-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono font-bold text-red-700 dark:text-red-300 text-xl tracking-wide">
                  ORDER-ID: {orderId}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  {order.status}
                </span>
              </div>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                <span>
                  <span className="font-bold">
                    {language === "th" ? "สั่งซื้อ" : "Ordered"}:
                  </span>{" "}
                  {order.created_at?.slice(0, 10) || "-"}
                </span>
                <span>
                  <span className="font-bold">
                    {language === "th" ? "อัปเดต" : "Updated"}:
                  </span>{" "}
                  {order.updated_at?.slice(0, 10) || "-"}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end justify-center min-w-[140px]">
              <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">
                {tOrdersDetails.total ||
                  (language === "th"
                    ? "ราคารวม (รวม VAT)"
                    : "Total (incl. VAT)")}
              </span>
              <span className="font-extrabold text-red-700 dark:text-red-300 text-3xl mt-1">
                ฿{(order.total_price * 1.07).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
            {tOrdersDetails.payment ||
              (language === "th" ? "การชำระเงิน" : "Payment")}
          </h2>

          {/* Modern payment card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-4 shadow-md border border-red-100 dark:border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-gray-800 text-red-700 dark:text-red-300 font-semibold">
                  {payment.payment_method?.toLowerCase() === "promptpay"
                    ? "PROMPTPAY"
                    : "CARD"}
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    (payment.payment_status || "").toString().toLowerCase() ===
                    "unpaid"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {(payment.payment_status || order.payment_status || "UNPAID")
                    .toString()
                    .toUpperCase()}
                </div>
              </div>

              <div className="flex-1">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {tOrdersDetails.payment ||
                    (language === "th"
                      ? "สถานะการชำระเงินและตัวเลือก"
                      : "Payment status and options")}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {payment.paid_at || order.paid_at ? (
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    <div className="font-semibold">
                      {tOrdersDetails.paidAt ||
                        (language === "th" ? "วันที่ชำระ" : "Paid At")}
                    </div>
                    <div className="text-xs">
                      {(payment.paid_at || order.paid_at)?.slice(0, 10)}{" "}
                      {(payment.paid_at || order.paid_at)?.slice(11, 19)}
                    </div>
                  </div>
                ) : null}

                {/* PromptPay button preserved as-is */}
                {(payment.payment_method || order.payment_method || "")
                  .toString()
                  .toLowerCase() === "promptpay" &&
                (payment.payment_status || order.payment_status || "")
                  .toString()
                  .toLowerCase() === "unpaid" ? (
                  <div>
                    <button
                      className="cursor-pointer px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-semibold shadow hover:scale-105 transform transition"
                      onClick={async () => {
                        try {
                          // refresh order data to be safe
                          const resOrder = await ApiService.getOrderById({
                            order_id: Number(
                              Array.isArray(orderId) ? orderId[0] : orderId
                            ),
                          });
                          const od =
                            resOrder.success && resOrder.data
                              ? resOrder.data
                              : orderData;
                          const paymentInfo = od?.payment || {};
                          const numericOrderId =
                            od?.order?.order_id ||
                            od?.order?.id ||
                            Number(
                              Array.isArray(orderId) ? orderId[0] : orderId
                            );
                          const amountValue =
                            paymentInfo?.amount ?? od?.order?.total_price ?? 0;

                          // load Omise if needed
                          if (
                            typeof window !== "undefined" &&
                            !(window as any).Omise
                          ) {
                            await new Promise<void>((resolve, reject) => {
                              const s = document.createElement("script");
                              s.src = "https://cdn.omise.co/omise.js";
                              s.async = true;
                              s.onload = () => resolve();
                              s.onerror = () =>
                                reject(new Error("Failed to load Omise"));
                              document.body.appendChild(s);
                            });
                          }
                          // @ts-ignore
                          (window as any).Omise.setPublicKey(
                            process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY
                          );

                          const amountSatang = Math.round(
                            (amountValue || 0) * 100
                          );

                          // create promptpay source and then create charge on backend
                          // @ts-ignore
                          (window as any).Omise.createSource(
                            "promptpay",
                            { amount: amountSatang, currency: "thb" },
                            async (statusCode: number, response: any) => {
                              if (
                                statusCode === 200 &&
                                response &&
                                response.type === "promptpay"
                              ) {
                                try {
                                  const resCharge = await ApiService.charge({
                                    token: response.id,
                                    order_id: numericOrderId,
                                    amount: amountValue,
                                  });
                                  const qr =
                                    resCharge.data?.charge?._attributes?.source
                                      ?.scannable_code?.image?.download_uri ||
                                    null;
                                  const chId =
                                    resCharge.data?.charge?.id ||
                                    resCharge.data?.charge?._attributes?.id ||
                                    resCharge.data?.charge_id ||
                                    null;
                                  setQrUrl(qr);
                                  setChargeId(chId);
                                  setShowPromptPay(true);
                                } catch (err) {
                                  console.error("PromptPay charge error", err);
                                }
                              } else {
                                console.error("createSource failed", response);
                              }
                            }
                          );
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                    >
                      {language === "th"
                        ? "จ่ายด้วย PromptPay"
                        : "Pay with PromptPay"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        {/* Shipping Tracking Table with Events */}
        {orderData.shipments && orderData.shipments.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4 flex items-center gap-2">
              <svg
                className="w-7 h-7 text-red-400 dark:text-red-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {tOrdersDetails.shippingTracking ||
                (language === "th"
                  ? "ติดตามสถานะการจัดส่ง"
                  : "Shipping Tracking")}
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-red-100 dark:border-gray-800 p-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-red-100 dark:divide-gray-800">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">
                      {tOrdersDetails.provider ||
                        (language === "th" ? "ขนส่ง" : "Provider")}
                    </th>
                    <th className="px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">
                      {tOrdersDetails.trackingCode ||
                        (language === "th" ? "รหัสพัสดุ" : "Tracking Code")}
                    </th>
                    <th className="px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">
                      {tOrdersDetails.shippedAt ||
                        (language === "th" ? "วันที่ส่ง" : "Shipped At")}
                    </th>
                    <th className="px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">
                      {language === "th" ? "ส่งไอเทมอะไร" : "Shipped Items"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderData.shipments.map((shipment: any) => (
                    <React.Fragment key={shipment.shipment_id}>
                      <tr
                        className="border-b border-red-100 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => handleToggleShipment(shipment)}
                      >
                        <td className="px-4 py-2">
                          {shipment.provider_name || shipment.provider_code}
                        </td>
                        <td className="px-4 py-2">
                          {shipment.external_shipment_code || "-"}
                        </td>
                        <td className="px-4 py-2">
                          {shipment.created_at
                            ? `${shipment.created_at
                                .slice(0, 16)
                                .replace("T", " ")}`
                            : "-"}
                        </td>
                        <td className="px-4 py-2">
                          {shipment.packages && shipment.packages.length > 0 ? (
                            <ul className="list-disc ml-4">
                              {shipment.packages.flatMap((pkg: any) =>
                                pkg.items && pkg.items.length > 0
                                  ? pkg.items.map((it: any) => {
                                      const itemInfo = Array.isArray(items)
                                        ? items.find(
                                            (i: any) =>
                                              i.order_item_id ===
                                              it.order_item_id
                                          )
                                        : null;
                                      return (
                                        <li key={it.order_item_id}>
                                          {itemInfo
                                            ? itemInfo.item_name
                                            : `ID ${it.order_item_id}`}{" "}
                                          ({language === "th" ? "จำนวน" : "Qty"}
                                          : {it.qty})
                                        </li>
                                      );
                                    })
                                  : []
                              )}
                            </ul>
                          ) : (
                            <span className="text-gray-400">
                              {language === "th" ? "ไม่มีข้อมูล" : "No data"}
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded tracking row */}
                      {expandedShipmentId === shipment.shipment_id && (
                        <tr className="bg-red-50 dark:bg-gray-800">
                          <td colSpan={4} className="p-4">
                            {loadingTracking &&
                            !trackingCache[String(shipment.shipment_id)] ? (
                              <div className="text-sm text-gray-500">
                                Loading tracking...
                              </div>
                            ) : null}

                            {trackingCache[String(shipment.shipment_id)] && (
                              <div>
                                {trackingCache[String(shipment.shipment_id)]
                                  .success ? (
                                  <div className="space-y-3">
                                    {/* Render timeline */}
                                    {Array.isArray(
                                      trackingCache[
                                        String(shipment.shipment_id)
                                      ].data?.states
                                    ) ? (
                                      <ol className="border-l-2 border-red-200 dark:border-gray-700 ml-4">
                                        {trackingCache[
                                          String(shipment.shipment_id)
                                        ].data.states.map(
                                          (st: any, idx: number) => (
                                            <li key={idx} className="mb-4 ml-4">
                                              <div className="text-sm text-gray-600 dark:text-gray-300">
                                                {st.datetime}
                                              </div>
                                              <div className="text-base font-semibold text-gray-800 dark:text-white">
                                                {st.status}{" "}
                                                {st.location
                                                  ? `- ${st.location}`
                                                  : ""}
                                              </div>
                                              <div className="text-sm text-gray-500">
                                                {st.description}
                                              </div>
                                              {st.info?.pod && (
                                                <div className="mt-2">
                                                  <a
                                                    href={st.info.pod}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-600 dark:text-blue-400 underline"
                                                  >
                                                    View POD / Signature
                                                  </a>
                                                </div>
                                              )}
                                            </li>
                                          )
                                        )}
                                      </ol>
                                    ) : (
                                      <div className="text-sm text-gray-500">
                                        No tracking states available.
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-sm text-red-500">
                                    {trackingCache[String(shipment.shipment_id)]
                                      .message || "Tracking not available"}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
            {tOrdersDetails.shippingAddress ||
              (language === "th" ? "ที่อยู่จัดส่ง" : "Shipping Address")}
          </h2>
          <div className="bg-red-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
            <div className="font-bold mb-2">
              <span className="text-gray-600 dark:text-gray-300 mr-2">
                {language === "th" ? "ชื่อ-นามสกุล" : "Name"}:
              </span>
              {shipping_address.first_name} {shipping_address.last_name}
            </div>
            <div className="mb-1">
              <span className="text-gray-600 dark:text-gray-300 mr-2">
                {language === "th" ? "ที่อยู่" : "Address"}:
              </span>
              {shipping_address.address_line1}
            </div>
            {shipping_address.address_line2 && (
              <div className="mb-1">
                <span className="text-gray-600 dark:text-gray-300 mr-2">
                  {language === "th" ? "ที่อยู่เพิ่มเติม" : "Address Line 2"}:
                </span>
                {shipping_address.address_line2}
              </div>
            )}
            <div className="mb-1">
              <span className="text-gray-600 dark:text-gray-300 mr-2">
                {language === "th" ? "ตำบล/แขวง" : "Sub-district"}:
              </span>
              {shipping_address.sub_district}
            </div>
            <div className="mb-1">
              <span className="text-gray-600 dark:text-gray-300 mr-2">
                {language === "th" ? "อำเภอ/เขต" : "District"}:
              </span>
              {shipping_address.district}
            </div>
            <div className="mb-1">
              <span className="text-gray-600 dark:text-gray-300 mr-2">
                {language === "th" ? "จังหวัด" : "Province"}:
              </span>
              {shipping_address.province}
            </div>
            <div className="mb-1">
              <span className="text-gray-600 dark:text-gray-300 mr-2">
                {language === "th" ? "รหัสไปรษณีย์" : "Postal Code"}:
              </span>
              {shipping_address.postal_code}
            </div>
            <div className="mb-1">
              <span className="text-gray-600 dark:text-gray-300 mr-2">
                {language === "th" ? "ประเทศ" : "Country"}:
              </span>
              {shipping_address.country}
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-300 mr-2">
                {language === "th" ? "เบอร์โทร" : "Phone"}:
              </span>
              {shipping_address.phone_number}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
            {tOrdersDetails.items}
          </h2>
          <ul className="divide-y divide-red-100 dark:divide-gray-800">
            {items.map((item: any) => (
              <li
                key={item.order_item_id || item.item_code}
                className="flex flex-col md:flex-col items-center md:items-stretch justify-between gap-4 py-5 px-2 bg-white/70 dark:bg-gray-900/70 rounded-xl shadow border border-red-100 dark:border-gray-800 mb-4"
              >
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between w-full gap-4">
                  {/* Image Section */}
                  <div className="flex-shrink-0 flex items-center justify-center w-full md:w-32">
                    <img
                      src={
                        Array.isArray(item.image_urls) &&
                        item.image_urls.length > 0
                          ? item.image_urls[0]
                          : "/Logo.png"
                      }
                      alt={item.item_name}
                      className="h-20 w-20 object-contain rounded-lg border border-red-100 dark:border-gray-700 bg-white dark:bg-gray-900"
                    />
                  </div>
                  {/* Info Section */}
                  <div className="flex flex-col flex-1 justify-center gap-2 text-left">
                    <Link
                      href={`/shop/${item.item_code}`}
                      className="font-semibold text-lg text-red-700 dark:text-red-300"
                    >
                      {item.item_name}
                    </Link>
                    <div className="text-sm text-gray-500">
                      {language === "th" ? "รหัสสินค้า" : "Code"}:{" "}
                      {item.item_code}
                    </div>
                    <div className="text-sm text-gray-500">
                      {language === "th" ? "ราคาต่อหน่วย" : "Unit Price"}: ฿
                      {item.unit_price}
                    </div>
                    <div className="text-sm text-gray-500">
                      {language === "th" ? "จำนวน" : "Quantity"}:{" "}
                      {item.quantity}
                    </div>
                  </div>
                  {/* Price & Rating Section */}

                  <div className="flex flex-col items-end justify-between gap-3 min-w-[90px]">
                    <span className="font-bold text-xl text-red-700 dark:text-red-300">
                      ฿{(item.total_price * 1.07).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {language === "th"
                        ? "รวมภาษี (VAT 7%)"
                        : "Incl. VAT (7%)"}
                      :
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500 mr-2">
                        {tOrdersDetails.rateProduct ||
                          (language === "th"
                            ? "ให้คะแนนสินค้า:"
                            : "Rate Product:")}
                      </span>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const key = String(
                          item.order_item_id || item.item_code
                        );
                        const isSending = !!sendingRatings[key];
                        const current = ratings[key] || 0;
                        return (
                          <button
                            key={star}
                            type="button"
                            className="cursor-pointer focus:outline-none"
                            onClick={() =>
                              handleRate(
                                item.order_item_id || item.item_code,
                                star,
                                item.item_code
                              )
                            }
                            disabled={isSending}
                            aria-disabled={isSending}
                          >
                            <svg
                              className={`w-5 h-5 ${
                                current >= star
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill={current >= star ? "currentColor" : "none"}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 17.75l-6.172 3.245 1.179-6.873L2 9.755l6.908-1.004L12 2.25l3.092 6.501L22 9.755l-5.007 4.367 1.179 6.873z"
                              />
                            </svg>
                          </button>
                        );
                      })}
                      {ratings[item.order_item_id || item.item_code] && (
                        <span className="ml-2 text-yellow-600 font-bold text-xs">
                          {tOrdersDetails.stars
                            ? `${
                                ratings[item.order_item_id || item.item_code]
                              } ${tOrdersDetails.stars}`
                            : language === "th"
                            ? `${
                                ratings[item.order_item_id || item.item_code]
                              } ดาว`
                            : `${
                                ratings[item.order_item_id || item.item_code]
                              } stars`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-between gap-4 mt-4">
                  <div className="mt-2 w-full ">
                    <label className="text-xs text-gray-500 mb-1 block">
                      {language === "th" ? "ความคิดเห็น" : "Comment"}
                    </label>
                    <div className="w-full flex align-center gap-2 justify-center">
                      <textarea
                        rows={1}
                        className="w-full px-3 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 resize-none"
                        placeholder={
                          language === "th"
                            ? "เขียนความเห็นเกี่ยวกับไอเทมนี้..."
                            : "Write your comment about this item..."
                        }
                        value={
                          // prefer local edited value so textarea remains editable;
                          // fall back to server-saved comment only when local value is undefined
                          comments[
                            String(item.order_item_id || item.item_code)
                          ] !== undefined
                            ? comments[
                                String(item.order_item_id || item.item_code)
                              ]
                            : (orderData?.item_reviews?.[item.item_code]
                                ?.comment as string | undefined) || ""
                        }
                        onChange={(e) =>
                          handleCommentChange(
                            String(item.order_item_id || item.item_code),
                            e.target.value
                          )
                        }
                      />

                      <div className="flex items-center justify-end gap-2 ">
                        {/* {sentComments[
                          String(item.order_item_id || item.item_code)
                        ] ||
                        !!orderData?.item_reviews?.[item.item_code]?.comment ? (
                          <div className="text-green-600 text-sm font-semibold">
                            {language === "th" ? "ส่งแล้ว" : "Sent"}
                          </div>
                        ) : null} */}

                        <button
                          className={`cursor-pointer px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
                            sendingComments[
                              String(item.order_item_id || item.item_code)
                            ]
                              ? "bg-gray-300 text-gray-700"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                          onClick={() =>
                            handleSendComment(
                              String(item.order_item_id || item.item_code),
                              item
                            )
                          }
                          disabled={
                            sendingComments[
                              String(item.order_item_id || item.item_code)
                            ]
                          }
                        >
                          {sendingComments[
                            String(item.order_item_id || item.item_code)
                          ]
                            ? language === "th"
                              ? "กำลังส่ง..."
                              : "Sending..."
                            : language === "th"
                            ? "ส่ง"
                            : "Send"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {showPromptPay && qrUrl && (
        <PromptPayModal
          qrUrl={qrUrl}
          chargeId={chargeId}
          orderId={Array.isArray(orderId) ? orderId[0] : orderId}
          onClose={() => {
            setShowPromptPay(false);
            setQrUrl(null);
            setChargeId(null);
            ApiService.getOrderById({
              order_id: Number(Array.isArray(orderId) ? orderId[0] : orderId),
            })
              .then((r) => {
                if (r.success && r.data) setOrderData(r.data);
              })
              .catch(() => {});
          }}
        />
      )}
    </main>
  );
}
