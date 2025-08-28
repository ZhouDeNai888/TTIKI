"use client";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ApiService from "@/utils/ApiService";
import ConfirmModal from "@/component/ConfirmModal";

export default function OrdersPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const tOrders = t.orders || {};
  // map status text to badge color classes
  const badgeClassFor = (status?: string) => {
    if (!status) return "bg-gray-200 text-gray-600";
    const s = status.toString().toLowerCase();
    if (s === "shipped") return "bg-green-100 text-green-700"; // ส่งแล้ว
    if (s === "shipping") return "bg-blue-100 text-blue-700"; // กำลังส่ง
    if (s === "pending") return "bg-yellow-100 text-yellow-700"; // รอดำเนินการ
    if (s === "canceled" || s === "cancel" || s === "failed")
      return "bg-red-100 text-red-700"; // ยกเลิก/ล้มเหลว
    if (s === "waiting") return "bg-orange-100 text-orange-700"; // รอ
    return "bg-gray-200 text-gray-600";
  };
  const router = useRouter();
  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCancelOrderId, setSelectedCancelOrderId] = useState<
    number | null
  >(null);
  // pagination
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  useEffect(() => {
    ApiService.getOrderByUser()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setError(res.message || "Failed to fetch orders.");
        }
      })
      .catch((err) => {
        setError(err.message || "Error fetching orders.");
      })
      .finally(() => setLoading(false));
  }, []);

  // clamp page when orders change
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [orders, page]);

  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(orders.length, page * pageSize);
  const visibleOrders = orders.slice(startIdx, endIdx);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10 text-black dark:text-white">
      <h1 className="text-3xl font-extrabold text-red-700 dark:text-red-300 mb-8 tracking-tight drop-shadow-sm text-center">
        {tOrders.myOrders || "My Orders"}
      </h1>
      <div className="w-full max-w-5xl flex flex-col gap-6 px-4">
        {loading ? (
          <div className="flex flex-col gap-6 mt-8">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-900 border border-red-100 dark:border-gray-800 rounded-2xl shadow flex flex-col md:flex-row items-center justify-between p-6 gap-4 animate-pulse"
              >
                <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
                  <div className="flex flex-col items-center md:items-start w-32">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  </div>
                  <div className="flex flex-col items-center md:items-end">
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:gap-4">
                  <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 dark:text-red-400 mt-8">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            {tOrders.noOrders || "You have no orders yet."}
          </div>
        ) : (
          visibleOrders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white dark:bg-gray-900 border border-red-100 dark:border-gray-800 rounded-2xl shadow flex flex-col md:flex-row items-center justify-between p-6 gap-4 hover:shadow-lg transition-all"
            >
              <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
                <div className="flex flex-col items-center md:items-start">
                  <span className="font-mono font-bold text-red-700 dark:text-red-300 text-lg mb-1">
                    ORDER-ID: {order.order_id}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString()
                      : "-"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold mb-2 ${badgeClassFor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex flex-col items-center md:items-end">
                  <span className="text-gray-700 dark:text-gray-200 text-sm">
                    {tOrders.items || "Items"}:{" "}
                    <span className="font-bold">{order.quantity}</span>
                  </span>
                  <span className="text-lg font-bold text-red-700 dark:text-red-300 mt-1">
                    {order.amount
                      ? `฿${(Number(order.amount) * 1.07).toLocaleString(
                          undefined,
                          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                        )}`
                      : "-"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:gap-4">
                <button
                  className="cursor-pointer px-5 py-2 bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 text-white rounded-xl font-bold shadow hover:scale-105 transition-all duration-200"
                  onClick={() => router.push(`/orders/${order.order_id}`)}
                >
                  {tOrders.viewDetails || "View Details"}
                </button>
                {order.status === "shipped" && (
                  <button
                    className="cursor-pointer px-5 py-2 bg-green-600 text-white rounded-xl font-bold shadow hover:scale-105 transition-all duration-200"
                    onClick={async () => {
                      try {
                        const res = await ApiService.buyAgainOrder(
                          Number(order.order_id)
                        );
                        if (res && res.success) {
                          // Save returned checkout payload to localStorage and go to checkout
                          try {
                            if (res.data !== undefined) {
                              localStorage.setItem(
                                "checkout",
                                JSON.stringify(res.data)
                              );
                            }
                          } catch (e) {
                            console.warn(
                              "Unable to save checkout to localStorage",
                              e
                            );
                          }
                          router.push("/check-out");
                        } else {
                          // noop: keep UI unchanged; backend may return message
                          console.warn("buyAgainOrder failed", res);
                        }
                      } catch (err) {
                        console.error("buyAgainOrder error", err);
                      }
                    }}
                  >
                    {tOrders.buyAgain || "Buy Again"}
                  </button>
                )}
                {/* {order.status === "shipping" && (
                  <button className="cursor-pointer px-5 py-2 bg-yellow-500 text-white rounded-xl font-bold shadow hover:scale-105 transition-all duration-200">
                    {tOrders.trackOrder || "Track Order"}
                  </button>
                )} */}
                {order.status === "pending" && (
                  <>
                    <button
                      className="cursor-pointer px-5 py-2 bg-red-400 text-white rounded-xl font-bold shadow hover:scale-105 transition-all duration-200"
                      onClick={() => {
                        setSelectedCancelOrderId(Number(order.order_id));
                        setConfirmOpen(true);
                      }}
                    >
                      {"ยกเลิกสินค้า"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
        {/* pagination controls */}
        <div className="w-full flex items-center justify-center gap-3 mt-6">
          <button
            className="cursor-pointer px-3 py-1 rounded bg-gray-100 dark:bg-gray-800"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={` cursor-pointer px-3 py-1 rounded ${
                    p === page
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <button
            className="cursor-pointer px-3 py-1 rounded bg-gray-100 dark:bg-gray-800"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      <ConfirmModal
        open={confirmOpen}
        title="ยืนยันการยกเลิก"
        message="คุณแน่ใจหรือไม่ ว่าต้องการยกเลิกคำสั่งซื้อนี้? การกระทำนี้ไม่สามารถยกเลิกได้"
        type="danger"
        confirmLabel="ยืนยัน"
        cancelLabel="ยกเลิก"
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedCancelOrderId(null);
        }}
        onConfirm={async () => {
          if (!selectedCancelOrderId) return;
          try {
            await ApiService.cancelUserOrder(selectedCancelOrderId);
            const refreshed = await ApiService.getOrderByUser();
            if (refreshed.success && Array.isArray(refreshed.data)) {
              setOrders(refreshed.data);
            }
          } catch (err) {
            console.error("Error cancelling order", err);
          } finally {
            setConfirmOpen(false);
            setSelectedCancelOrderId(null);
          }
        }}
      />
    </main>
  );
}
