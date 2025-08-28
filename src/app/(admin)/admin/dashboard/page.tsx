"use client";
import { translations } from "@/utils/translation";
import { useLanguage } from "@/context/LanguageContext";

import React, { useRef, useState } from "react";
import Image from "next/image";
import ApiService from "@/utils/ApiService";

export default function AdminDashboard() {
  const { language } = useLanguage();
  const t = translations[language].dashboard;
  // For drag-to-scroll on horizontal card area
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const scrollLeft = React.useRef(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
    document.body.style.cursor = "grabbing";
  };
  const handleMouseLeave = () => {
    isDragging.current = false;
    document.body.style.cursor = "";
  };
  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = "";
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = x - startX.current;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft.current - walk;
    }
  };
  // Touch events for mobile
  const touchStartX = React.useRef(0);
  const touchScrollLeft = React.useRef(0);
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    touchStartX.current = e.touches[0].pageX;
    touchScrollLeft.current = scrollRef.current.scrollLeft;
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    const x = e.touches[0].pageX;
    const walk = x - touchStartX.current;
    scrollRef.current.scrollLeft = touchScrollLeft.current - walk;
  };
  const [topProducts, setTopProducts] = React.useState<any[]>([]);

  const [topRated, setTopRated] = React.useState<any[]>([]);

  const [topBuyers, setTopBuyers] = React.useState<any[]>([]);

  const [topProvinces, setTopProvinces] = React.useState<any[]>([]);

  // Mock data for top repeat-buying countries (kept for potential future use)
  const [topRepeatCountries] = React.useState<any[]>([]);

  const [topRepeatProvinces, setTopRepeatProvinces] = React.useState<any[]>([]);

  // Mock data for top repeat buyers
  const [topRepeatBuyers, setTopRepeatBuyers] = React.useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = React.useState<boolean>(true);

  // Fetch analytics once on mount and map to our display shapes
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingAnalytics(true);
      try {
        const [
          repeatBuyersRes,
          sellingRes,
          ratedRes,
          buyersByQtyRes,
          provincesRepeatRes,
          provincesByQtyRes,
        ] = await Promise.all([
          ApiService.getTopRepeatBuyers(),
          ApiService.getTopSellingItems(),
          ApiService.getTopRatedItems(),
          ApiService.getTopBuyersByQuantity(),
          ApiService.getTopProvincesRepeatUsers(),
          ApiService.getTopProvincesByQuantity(),
        ]);

        if (!mounted) return;

        if (sellingRes?.success && Array.isArray(sellingRes.data)) {
          setTopProducts(
            sellingRes.data.map((it: any) => ({
              name: it.name ?? it.item_name ?? it.title ?? "Unknown",
              sold: Number(
                it.sold ?? it.quantity ?? it.count ?? it.total_sold ?? 0
              ),
            }))
          );
        }

        if (ratedRes?.success && Array.isArray(ratedRes.data)) {
          setTopRated(
            ratedRes.data.map((it: any) => ({
              name: it.name ?? it.item_name ?? "Unknown",
              rating: Number(it.avg_rating ?? it.score ?? 0).toFixed(1),
            }))
          );
        }

        if (buyersByQtyRes?.success && Array.isArray(buyersByQtyRes.data)) {
          setTopBuyers(
            buyersByQtyRes.data.map((it: any) => ({
              name: it.name ?? it.username ?? it.buyer ?? "Unknown",
              total: Number(it.total_quantity ?? 0),
            }))
          );
        }

        if (
          provincesByQtyRes?.success &&
          Array.isArray(provincesByQtyRes.data)
        ) {
          setTopProvinces(
            provincesByQtyRes.data.map((it: any) => ({
              name: it.name ?? it.province ?? "Unknown",
              total: Number(it.total_amount ?? 0),
            }))
          );
        }

        if (
          provincesRepeatRes?.success &&
          Array.isArray(provincesRepeatRes.data)
        ) {
          setTopRepeatProvinces(
            provincesRepeatRes.data.map((it: any) => ({
              name: it.name ?? it.province ?? "Unknown",
              repeat: Number(it.repeat_user_count ?? 0),
            }))
          );
        }

        if (repeatBuyersRes?.success && Array.isArray(repeatBuyersRes.data)) {
          setTopRepeatBuyers(
            repeatBuyersRes.data.map((it: any) => ({
              name: it.name ?? it.username ?? it.buyer ?? "Unknown",
              repeat: Number(it.orders_count ?? it.count ?? it.times ?? 0),
            }))
          );
        }
      } catch (err) {
        // keep mock data on error and print to console for debugging
        console.error("Failed to load admin analytics:", err);
      } finally {
        if (mounted) setLoadingAnalytics(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Monthly sales state (populated from backend timeseries) - fallback to mock data
  const initialMonthlySales = [
    1200, 1500, 1800, 2200, 2000, 2500, 2700, 3000, 3200, 3100, 3300, 3500,
  ];
  const initialMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const [monthlySales, setMonthlySales] =
    useState<number[]>(initialMonthlySales);
  const [months, setMonths] = useState<string[]>(initialMonths);
  // Interval selector: 'day' (last 30 days), 'month' (last 12 months), 'year' (last 5 years)
  const [interval, setInterval] = React.useState<"day" | "month" | "year">(
    "month"
  );
  const [loadingTimeseries, setLoadingTimeseries] = React.useState(false);

  // Fetch monthly payment timeseries for the selected interval
  React.useEffect(() => {
    const fetchTimeseries = async () => {
      try {
        setLoadingTimeseries(true);
        const end = new Date();
        // determine window based on selected interval
        let start: Date;
        if (interval === "day") {
          // last 30 days
          start = new Date(end);
          start.setDate(end.getDate() - 29);
        } else if (interval === "year") {
          // last 5 years
          start = new Date(end.getFullYear() - 4, 0, 1);
        } else {
          // month - last 12 months
          start = new Date(end.getFullYear(), end.getMonth(), 1);
          start.setMonth(start.getMonth() - 11);
        }

        const fmt = (d: Date) => d.toISOString().slice(0, 10);
        const res = await ApiService.getPaymentAmountTimeseries({
          start_date: fmt(start),
          end_date: fmt(end),
          interval: interval,
        });
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          // Normalize rows and aggregate depending on interval
          const map = new Map<string, number>();
          const labelMap = new Map<string, Date | string>();

          for (const row of res.data) {
            const raw = row.period ?? row.date ?? row.period;
            let d = new Date(String(raw));
            if (isNaN(d.getTime())) {
              const parts = String(raw || "").split("-");
              if (parts.length >= 1) {
                const y = Number(parts[0]) || new Date().getFullYear();
                const mo = Number(parts[1]) - 1 || 0;
                const day = parts[2] ? Number(parts[2]) : 1;
                d = new Date(y, mo, day);
              }
            }
            if (isNaN(d.getTime())) continue;

            let key: string;
            let label: string | Date;
            if (interval === "day") {
              key = d.toISOString().slice(0, 10);
              label = d;
            } else if (interval === "year") {
              key = String(d.getFullYear());
              label = key;
            } else {
              key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                2,
                "0"
              )}`;
              label = new Date(d.getFullYear(), d.getMonth(), 1);
            }

            const amt = Number(row.total_amount ?? row.amount ?? 0) || 0;
            map.set(key, (map.get(key) || 0) + amt);
            if (!labelMap.has(key)) labelMap.set(key, label);
          }

          const sortedKeys = Array.from(map.keys()).sort((a, b) => {
            if (interval === "year") return Number(a) - Number(b);
            return (
              new Date(a + (interval === "month" ? "-01" : "")).getTime() -
              new Date(b + (interval === "month" ? "-01" : "")).getTime()
            );
          });

          const labels = sortedKeys.map((k) => {
            const v = labelMap.get(k);
            if (interval === "day" && v instanceof Date) {
              return v.toLocaleString(undefined, {
                day: "numeric",
                month: "short",
              });
            }
            if (interval === "month" && v instanceof Date) {
              return v.toLocaleString(undefined, {
                month: "short",
                year: "numeric",
              });
            }
            return String(v);
          });
          const amounts = sortedKeys.map((k) => Number(map.get(k) || 0));

          setMonths(labels);
          setMonthlySales(amounts);
          setLoadingTimeseries(false);
        }
      } catch (err) {
        console.error("Failed to load payment timeseries", err);
        setLoadingTimeseries(false);
      }
    };
    fetchTimeseries();
  }, [interval]);
  // Chart.js dynamic import (Line and Bar)
  const [ChartComponent, setChartComponent] = React.useState<any>(null);
  const [BarComponent, setBarComponent] = React.useState<any>(null);
  React.useEffect(() => {
    import("chart.js/auto").then(() => {
      import("react-chartjs-2").then((mod) => {
        setChartComponent(() => mod.Line);
        setBarComponent(() => mod.Bar);
      });
    });
  }, []);
  // (kept as state at top of file)
  const [adminInfo, setAdminInfo] = React.useState<any>(null);
  React.useEffect(() => {
    const match = document.cookie.match(/admin=([^;]+)/);
    if (match) {
      try {
        setAdminInfo(JSON.parse(decodeURIComponent(match[1])));
      } catch {}
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-8xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <Image
          src="/Logo.png"
          alt="TTKI Logo"
          width={80}
          height={45}
          className="mb-4 rounded-lg bg-white dark:bg-gray-800"
        />
        <h1 className="text-3xl font-extrabold text-red-700 dark:text-red-300 mb-2">
          {t.title}
        </h1>
        {adminInfo ? (
          <div className="mb-6 text-center">
            <div className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-1">
              {t.welcome} {adminInfo.username}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {adminInfo.email}
            </div>
          </div>
        ) : (
          <div className="mb-6 text-center text-red-600 font-bold">
            {t.notLoggedIn}
          </div>
        )}

        {/* Dashboard Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 my-8">
          {/* Top 10 Repeat Buyers (List only) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 md:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-red-700 dark:text-red-300">
                {t.monthlySales}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 mr-2">แสดงเป็น</span>
                <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                  <button
                    className={`cursor-pointer px-3 py-1 rounded-md text-sm ${
                      interval === "day"
                        ? "bg-red-600 text-white"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                    onClick={() => setInterval("day")}
                  >
                    วัน
                  </button>
                  <button
                    className={`cursor-pointer px-3 py-1 rounded-md text-sm ${
                      interval === "month"
                        ? "bg-red-600 text-white"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                    onClick={() => setInterval("month")}
                  >
                    เดือน
                  </button>
                  <button
                    className={`cursor-pointer px-3 py-1 rounded-md text-sm ${
                      interval === "year"
                        ? "bg-red-600 text-white"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                    onClick={() => setInterval("year")}
                  >
                    ปี
                  </button>
                </div>
                {loadingTimeseries && (
                  <div className="text-sm text-gray-500 ml-3">กำลังโหลด...</div>
                )}
              </div>
            </div>
            {loadingTimeseries || loadingAnalytics ? (
              <div className="w-full h-48 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ) : (
              ChartComponent && (
                <ChartComponent
                  data={{
                    labels: months,
                    datasets: [
                      {
                        label: "ยอดขาย (บาท)",
                        data: monthlySales,
                        borderColor: "#e11d48",
                        backgroundColor: "rgba(225,29,72,0.1)",
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                  }}
                  height={50}
                />
              )
            )}
          </div>
          {/* 10-rank dashboard cards: horizontal scrollable area */}
          <div
            className="w-full overflow-x-auto col-span-1 md:col-span-3 cursor-grab select-none scrollbar-hide"
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style jsx global>{`
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`}</style>
            <div className="flex gap-8 min-w-[900px] pb-2">
              {/* Sales Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 min-w-[340px] max-w-xs flex-1">
                <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4">
                  {t.topRepeatBuyers}
                </h2>
                <ol className="list-decimal ml-6">
                  {loadingAnalytics
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <li
                          key={i}
                          className="mb-3 flex justify-between items-center"
                        >
                          <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </li>
                      ))
                    : topRepeatBuyers.map((b, i) => (
                        <li
                          key={b.name}
                          className="mb-1 flex justify-between items-center"
                        >
                          <span>
                            {i + 1}. {b.name}
                            {i === 0 && (
                              <span
                                className="inline-block align-middle ml-1"
                                title={t.rank1}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="#facc15"
                                  className="w-5 h-5 inline"
                                >
                                  <path d="M10 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32-3.87-3.77 5.34-.78L10 2z" />
                                </svg>
                              </span>
                            )}
                          </span>
                          <span className="font-bold text-pink-700">
                            {b.repeat} {t.times}
                          </span>
                        </li>
                      ))}
                </ol>
              </div>
              {/* Top 10 Products Sold */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 min-w-[340px] max-w-xs flex-1">
                <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4">
                  {t.topProducts}
                </h2>
                <ol className="list-decimal ml-6">
                  {loadingAnalytics
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <li
                          key={i}
                          className="mb-3 flex justify-between items-center"
                        >
                          <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </li>
                      ))
                    : topProducts.map((p, i) => (
                        <li
                          key={p.name}
                          className="mb-1 flex justify-between items-center"
                        >
                          <span>
                            {i + 1}. {p.name}
                            {i === 0 && (
                              <span
                                className="inline-block align-middle ml-1"
                                title={t.rank1}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="#facc15"
                                  className="w-5 h-5 inline"
                                >
                                  <path d="M10 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32-3.87-3.77 5.34-.78L10 2z" />
                                </svg>
                              </span>
                            )}
                          </span>
                          <span className="font-bold text-red-700">
                            {p.sold} {t.pieces}
                          </span>
                        </li>
                      ))}
                </ol>
              </div>
              {/* Top 10 Rated Products */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 min-w-[340px] max-w-xs flex-1">
                <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4">
                  {t.topRated}
                </h2>
                <ol className="list-decimal ml-6">
                  {loadingAnalytics
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <li
                          key={i}
                          className="mb-3 flex justify-between items-center"
                        >
                          <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </li>
                      ))
                    : topRated.map((p, i) => (
                        <li
                          key={p.name}
                          className="mb-1 flex justify-between items-center"
                        >
                          <span>
                            {i + 1}. {p.name}
                            {i === 0 && (
                              <span
                                className="inline-block align-middle ml-1"
                                title={t.rank1}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="#facc15"
                                  className="w-5 h-5 inline"
                                >
                                  <path d="M10 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32-3.87-3.77 5.34-.78L10 2z" />
                                </svg>
                              </span>
                            )}
                          </span>
                          <span className="font-bold text-yellow-500">
                            {t.score} {p.rating}
                          </span>
                        </li>
                      ))}
                </ol>
              </div>
              {/* Top 10 Buyers */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 min-w-[340px] max-w-xs flex-1">
                <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4">
                  {t.topBuyers}
                </h2>
                <ol className="list-decimal ml-6">
                  {loadingAnalytics
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <li
                          key={i}
                          className="mb-3 flex justify-between items-center"
                        >
                          <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </li>
                      ))
                    : topBuyers.map((b, i) => (
                        <li
                          key={b.name}
                          className="mb-1 flex justify-between items-center"
                        >
                          <span>
                            {i + 1}. {b.name}
                            {i === 0 && (
                              <span
                                className="inline-block align-middle ml-1"
                                title={t.rank1}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="#facc15"
                                  className="w-5 h-5 inline"
                                >
                                  <path d="M10 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32-3.87-3.77 5.34-.78L10 2z" />
                                </svg>
                              </span>
                            )}
                          </span>
                          <span className="font-bold text-green-700">
                            {t.baht}
                            {b.total.toLocaleString()}
                          </span>
                        </li>
                      ))}
                </ol>
              </div>
              {/* Top Repeat-Buying Provinces */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 min-w-[340px] max-w-xs flex-1">
                <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4">
                  {t.topRepeatProvinces}
                </h2>
                <ol className="list-decimal ml-6">
                  {loadingAnalytics
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <li
                          key={i}
                          className="mb-3 flex justify-between items-center"
                        >
                          <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </li>
                      ))
                    : topRepeatProvinces.map((p, i) => (
                        <li
                          key={p.name}
                          className="mb-1 flex justify-between items-center"
                        >
                          <span>
                            {i + 1}. {p.name}
                            {i === 0 && (
                              <span
                                className="inline-block align-middle ml-1"
                                title={t.rank1}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="#facc15"
                                  className="w-5 h-5 inline"
                                >
                                  <path d="M10 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32-3.87-3.77 5.34-.78L10 2z" />
                                </svg>
                              </span>
                            )}
                          </span>
                          <span className="font-bold text-purple-700">
                            {p.repeat} {t.times}
                          </span>
                        </li>
                      ))}
                </ol>
              </div>
              {/* Top Provinces */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 min-w-[340px] max-w-xs flex-1">
                <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4">
                  {t.topProvinces}
                </h2>
                <ol className="list-decimal ml-6">
                  {loadingAnalytics
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <li
                          key={i}
                          className="mb-3 flex justify-between items-center"
                        >
                          <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </li>
                      ))
                    : topProvinces.map((p, i) => (
                        <li
                          key={p.name}
                          className="mb-1 flex justify-between items-center"
                        >
                          <span>
                            {i + 1}. {p.name}
                            {i === 0 && (
                              <span
                                className="inline-block align-middle ml-1"
                                title={t.rank1}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="#facc15"
                                  className="w-5 h-5 inline"
                                >
                                  <path d="M10 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32-3.87-3.77 5.34-.78L10 2z" />
                                </svg>
                              </span>
                            )}
                          </span>
                          <span className="font-bold text-purple-700">
                            {t.baht}
                            {p.total.toLocaleString()}
                          </span>
                        </li>
                      ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Item Code Manage */}
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center cursor-pointer hover:bg-red-50 dark:hover:bg-gray-900 transition"
            onClick={() => (window.location.href = "/admin/item-code-manage")}
          >
            <span className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
              {"Item Code"}
            </span>
            <span className="text-gray-600 dark:text-gray-300 text-center">
              {
                "จัดการรหัสสินค้า (Item Code) สำหรับสินค้าที่ไม่มีรหัสสินค้าเฉพาะ"
              }
            </span>
          </div>
          {/* Price Manage */}
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center cursor-pointer hover:bg-red-50 dark:hover:bg-gray-900 transition"
            onClick={() => (window.location.href = "/admin/price-manage")}
          >
            <span className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
              {t.priceManage}
            </span>
            <span className="text-gray-600 dark:text-gray-300 text-center">
              {t.priceManageDesc}
            </span>
          </div>
          {/* Manage Products */}
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center cursor-pointer hover:bg-red-50 dark:hover:bg-gray-900 transition"
            onClick={() => (window.location.href = "/admin/items-manage")}
          >
            <span className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
              {t.manageProducts}
            </span>
            <span className="text-gray-600 dark:text-gray-300 text-center">
              {t.manageProductsDesc}
            </span>
          </div>
          {/* View Orders */}
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center cursor-pointer hover:bg-red-50 dark:hover:bg-gray-900 transition"
            onClick={() => (window.location.href = "/admin/order-manage")}
          >
            <span className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
              {t.viewOrders}
            </span>
            <span className="text-gray-600 dark:text-gray-300 text-center">
              {t.viewOrdersDesc}
            </span>
          </div>
          {/* Manage Users */}
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center cursor-pointer hover:bg-red-50 dark:hover:bg-gray-900 transition"
            onClick={() => (window.location.href = "/admin/users-manage")}
          >
            <span className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
              {t.manageUsers}
            </span>
            <span className="text-gray-600 dark:text-gray-300 text-center">
              {t.manageUsersDesc}
            </span>
          </div>
          {/* News Manage */}
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center cursor-pointer hover:bg-red-50 dark:hover:bg-gray-900 transition"
            onClick={() => (window.location.href = "/admin/news-manage")}
          >
            <span className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
              {t.newsManage}
            </span>
            <span className="text-gray-600 dark:text-gray-300 text-center">
              {t.newsManageDesc}
            </span>
          </div>
          {/* Notify */}
          <div
            className="col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center cursor-pointer hover:bg-red-50 dark:hover:bg-gray-900 transition"
            onClick={() => (window.location.href = "/admin/notify")}
          >
            <span className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
              {"แจ้งเตือน"}
            </span>
            <span className="text-gray-600 dark:text-gray-300 text-center">
              {"ส่งข้อความแจ้งเตือนไปยังผู้ใช้ทั้งหมด (Notification)"}
            </span>
          </div>
          {/* Settings */}
          <div
            className="col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center cursor-pointer hover:bg-red-50 dark:hover:bg-gray-900 transition"
            onClick={() => (window.location.href = "/admin/admin-setting")}
          >
            <span className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
              {t.settings}
            </span>
            <span className="text-gray-600 dark:text-gray-300 text-center">
              {t.settingsDesc}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
