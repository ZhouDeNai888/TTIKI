"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminNotify } from "@/context/AdminNotifyContext";

type NotifyEntry = {
  id: string;
  type: string | null;
  payload: Record<string, any>;
};

export default function AdminNotifyPage() {
  const { list } = useAdminNotify();
  const [mounted, setMounted] = useState<boolean>(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const receivedRef = { current: false } as { current: boolean };
  const router = useRouter();

  useEffect(() => {
    // mark mounted after first client render to avoid SSR/client markup mismatch
    setMounted(true);
    // if provider already has items, stop loading
    if (list && list.length > 0) {
      receivedRef.current = true;
      setLoading(false);
    }
    const fallback = setTimeout(() => {
      if (!receivedRef.current) {
        receivedRef.current = true;
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(fallback);
  }, [list]);

  // admin: intentionally ignore read/unread state

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [list.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedList = list.slice(startIndex, endIndex);

  return (
    <div className="max-w-3xl mx-auto p-6 mt-30">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            🔔 แจ้งเตือน
          </h3>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              {mounted ? `รวม ${list.length} รายการ` : ""}
            </div>
          </div>
        </div>

        <ul className="space-y-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <li key={`skeleton-${i}`} className="relative">
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-tr-md rounded-br-md bg-slate-200 dark:bg-slate-700" />
                  <div className="ml-3 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 rounded-md shadow-sm p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </li>
              ))
            : pagedList.map((ev) => {
                const p = ev.payload ?? {};
                const isExpanded = expandedIds.has(ev.id);
                const header = p._meta_message ?? ev.type ?? "Notification";
                const typeColor = (() => {
                  const t = (ev.type || "").toLowerCase();
                  if (t === "info") return "bg-blue-500";
                  if (t === "warning") return "bg-yellow-400";
                  if (t === "error") return "bg-red-500";
                  return "bg-slate-300 dark:bg-slate-600";
                })();
                const typeBadge = (() => {
                  const t = (ev.type || "").toLowerCase();
                  if (t === "info")
                    return (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md mr-2">
                        INFO
                      </span>
                    );
                  if (t === "warning")
                    return (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md mr-2">
                        WARNING
                      </span>
                    );
                  if (t === "error")
                    return (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-md mr-2">
                        ERROR
                      </span>
                    );
                  return null;
                })();
                const createdVal = p._meta_created_at ?? p.created_at;
                const createdStr = createdVal
                  ? new Date(createdVal).toLocaleString()
                  : null;
                return (
                  <li key={ev.id} className="relative">
                    <span
                      className={`absolute left-0 top-2 bottom-2 w-1 rounded-tr-md rounded-br-md ${typeColor}`}
                    />
                    <div className="ml-3 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 rounded-md shadow-sm hover:shadow-md transition-shadow overflow-hidden relative">
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedIds((s) => {
                            const next = new Set(s);
                            if (next.has(ev.id)) next.delete(ev.id);
                            else next.add(ev.id);
                            return next;
                          });
                        }}
                        className="cursor-pointer w-full text-left flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate flex items-center gap-2">
                            {typeBadge}
                            <span className="truncate">{header}</span>
                            {/* {(p._meta_status ?? p.status) && (
                              <span className="ml-2 inline-block text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
                                {String(p._meta_status ?? p.status)}
                              </span>
                            )} */}
                          </div>
                          {createdStr && (
                            <div className="text-xs text-gray-500 truncate mt-1">
                              <time dateTime={String(createdVal || "")}>
                                {createdStr}
                              </time>
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 transform transition-transform ${
                              isExpanded ? "rotate-180" : "rotate-0"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-3 pt-0 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 rounded-b-md">
                          {Object.entries(p)
                            .filter(
                              ([k]) =>
                                !k.startsWith("_meta_") &&
                                k !== "updated_at" &&
                                k !== "created_at"
                            )
                            .map(([k, v]) => (
                              <div
                                key={k}
                                className="flex gap-3 py-2 items-start"
                              >
                                <div className="font-mono text-xs text-gray-700 dark:text-gray-300 w-36">
                                  {k}:
                                </div>
                                <div className="flex-1 text-sm">
                                  <div className="text-gray-800 dark:text-gray-100 truncate">
                                    {typeof v === "object"
                                      ? JSON.stringify(v, null, 2)
                                      : String(v)}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {isExpanded && p.order_id && (
                        <div className="absolute right-3 bottom-3">
                          <button
                            type="button"
                            aria-label={`ดูคำสั่งซื้อ ${String(p.order_id)}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              try {
                                window.dispatchEvent(
                                  new CustomEvent("closeUserDropdown")
                                );
                              } catch (err) {
                                // ignore
                              }
                              router.push(
                                `/admin/order-manage/${String(p.order_id)}`
                              );
                            }}
                            className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 7h2l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12h2M16 11a4 4 0 01-8 0"
                              />
                            </svg>
                            <span>ดูคำสั่งซื้อ</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}

          {list.length === 0 && (
            <li className="text-center text-sm text-gray-500 py-8">
              ยังไม่มีการแจ้งเตือน
            </li>
          )}
        </ul>

        {list.length > pageSize && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              แสดง {Math.min(list.length, startIndex + 1)} -{" "}
              {Math.min(list.length, endIndex)} จาก {list.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="cursor-pointer px-3 py-1 bg-white dark:bg-slate-800 border rounded-md text-sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                หน้า {currentPage} / {totalPages}
              </div>
              <button
                className="cursor-pointer px-3 py-1 bg-white dark:bg-slate-800 border rounded-md text-sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
