"use client";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

import ApiService from "@/utils/ApiService";

type Order = {
  order_id: number;
  user_id: number;
  total_price: number;
  payment_method: string;
  payment_status: string;
  paid_at: string | null;
  shipping_code: string;
  shipping_provider: string;
  shipping_status: string;
  shipped_at: string | null;
  username: string;
  address: string;
  status: string;
  note: string;
  created_at: string;
  updated_at: string;
};
export default function OrderManagePage() {
  const { language } = useLanguage();
  const t = translations[language].ordermanage;
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [paymentMethod, setPaymentMethod] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState<string>("all");
  // pagination
  const [page, setPage] = useState<number>(1);
  const perPage = 9;
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await ApiService.getAllOrdersAdmin();
        if (res.success && Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setError(res.message || "Failed to fetch orders");
        }
      } catch (err) {
        setError((err as Error).message);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);
  // reset page when filter or orders change
  useEffect(() => {
    setPage(1);
  }, [filter, paymentMethod, paymentStatus, orders.length]);
  // const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (
      filter !== "all" &&
      (o.status || "").toLowerCase() !== filter.toLowerCase()
    )
      return false;
    if (paymentMethod !== "all" && (o.payment_method || "") !== paymentMethod)
      return false;
    if (
      paymentStatus !== "all" &&
      (o.payment_status || "").toLowerCase() !== paymentStatus.toLowerCase()
    )
      return false;
    return true;
  });

  // pagination calculations for filtered orders
  const totalFiltered = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const pageItems = filteredOrders.slice(startIndex, startIndex + perPage);

  return (
    <div className="w-full max-w-8xl mx-auto bg-white dark:bg-gray-900  shadow-2xl p-8 mt-30 mb-95">
      <h2 className="text-2xl font-extrabold text-red-700 dark:text-red-300 mb-6 text-center">
        {t.title}
      </h2>
      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">{t.filterAll}</option>
          <option value="pending">{t.filterPending}</option>
          <option value="shipping">{t.filterShipped}</option>
          <option value="shipped">{t.filterDelivered}</option>
          <option value="canceled">{t.filterCancelled}</option>
        </select>

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Payment Methods</option>
          <option value="promptpay">promptpay</option>
          <option value="card">card</option>
          <option value="banktransfer">banktransfer</option>
          <option value="cod">cod</option>
        </select>

        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Payment Status</option>
          <option value="paid">paid</option>
          <option value="unpaid">unpaid</option>
        </select>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="w-full text-center py-10">
          <span className="text-lg text-red-600 dark:text-red-400">
            {error}
          </span>
        </div>
      ) : (
        <>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-300">
              No orders found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageItems.map((o) => (
                  <div
                    key={o.order_id}
                    role="button"
                    onClick={() =>
                      router.push(`/admin/order-manage/${o.order_id}`)
                    }
                    className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-red-300 dark:hover:border-red-600 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                          Order #{o.order_id}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          User: {o.user_id}
                        </div>
                      </div>
                      <div>
                        <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                          {o.created_at}
                        </div>
                        <div className="text-right text-xs text-gray-400">
                          {o.updated_at}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {o.username || "-"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {o.address
                            ? o.address.slice(0, 60) +
                              (o.address.length > 60 ? "..." : "")
                            : "-"}
                        </div>
                        {/* Payment method & status - styled badges */}
                        <div className="mt-2 flex items-center gap-3">
                          {/* Method badge */}
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                            {((pm: string) => {
                              const p = (pm || "").toString().toLowerCase();
                              if (p === "promptpay")
                                return <span className="text-xl">⛶</span>;
                              if (p === "card" || p === "creditcard")
                                return <span className="text-xl">💳</span>;
                              if (p === "banktransfer")
                                return <span className="text-xl">🏦</span>;
                              if (p === "cod")
                                return <span className="text-xl">📦</span>;
                              return <span className="text-xl">💰</span>;
                            })(o.payment_method)}
                            <span className="leading-none">
                              {(() => {
                                const m = (o.payment_method || "")
                                  .toString()
                                  .toLowerCase();
                                if (!m) return "-";
                                if (m === "promptpay") return "PromptPay";
                                if (m === "card" || m === "creditcard")
                                  return "Card";
                                if (m === "banktransfer")
                                  return "Bank Transfer";
                                if (m === "cod") return "COD";
                                return m;
                              })()}
                            </span>
                          </div>

                          {/* Status badge */}
                          <div>
                            {(() => {
                              const s = (o.payment_status || "")
                                .toString()
                                .toLowerCase();
                              const cls =
                                s === "unpaid"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                  : s === "paid"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                  : s === "pending"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-100";
                              const label = s
                                ? s.charAt(0).toUpperCase() + s.slice(1)
                                : "-";
                              return (
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${cls}`}
                                >
                                  {label}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-800 dark:text-gray-100">
                          {Number(o.total_price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-xs mt-1">
                          <span
                            className={
                              o.status?.toLowerCase() === "pending"
                                ? "px-2 py-1 rounded-full text-yellow-700 bg-yellow-100"
                                : o.status?.toLowerCase() === "shipping"
                                ? "px-2 py-1 rounded-full text-blue-700 bg-blue-100"
                                : o.status?.toLowerCase() === "shipped" ||
                                  o.status?.toLowerCase() === "completed"
                                ? "px-2 py-1 rounded-full text-green-800 bg-green-100"
                                : o.status?.toLowerCase() === "cancelled"
                                ? "px-2 py-1 rounded-full text-gray-600 bg-gray-100"
                                : "px-2 py-1 rounded-full text-gray-700 bg-gray-100"
                            }
                          >
                            {o.status
                              ? o.status.charAt(0).toUpperCase() +
                                o.status.slice(1)
                              : "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {o.note && (
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        Note:{" "}
                        {o.note.length > 120
                          ? o.note.slice(0, 120) + "..."
                          : o.note}
                      </div>
                    )}

                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      Shipping: {o.shipping_provider || "-"}{" "}
                      {o.shipping_code ? `• ${o.shipping_code}` : ""}
                    </div>
                  </div>
                ))}
              </div>

              {/* pagination controls */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </button>
                <div className="text-sm text-gray-600">
                  หน้า {page} /{" "}
                  {Math.max(1, Math.ceil(filteredOrders.length / perPage))}
                </div>
                <button
                  className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
                  onClick={() =>
                    setPage((p) =>
                      Math.min(
                        Math.max(1, Math.ceil(filteredOrders.length / perPage)),
                        p + 1
                      )
                    )
                  }
                  disabled={page >= Math.ceil(filteredOrders.length / perPage)}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {/* Totals bar */}
          <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg shadow flex justify-end">
            <div className="text-sm text-gray-700 dark:text-gray-200 font-bold">
              Total:&nbsp;
              {filteredOrders
                .reduce((sum, o) => sum + Number(o.total_price || 0), 0)
                .toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
