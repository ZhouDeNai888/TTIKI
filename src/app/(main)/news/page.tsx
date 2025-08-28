"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";

import ApiService from "@/utils/ApiService";

export default function NewsPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const tNews = t.news || {};
  const pageSize = 8;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    setEndDate(new Date().toISOString().slice(0, 10)); // Set default end date to today
    ApiService.getAllNews()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setNewsList(res.data);
        } else {
          setError(res.message || "ไม่พบข่าว");
        }
      })
      .catch((err) => setError(err.message || "เกิดข้อผิดพลาด"))
      .finally(() => setLoading(false));
  }, []);

  // Filter news by search (title, content, author, tags) and date range
  const filteredNews = newsList.filter((news) => {
    const title = news.title || "";
    const content = news.content || "";
    const author = news.author || "";
    const tags = Array.isArray(news.tags)
      ? news.tags.join(" ")
      : news.tags || "";
    const date = news.published_at || news.date || "";
    const searchText = search.toLowerCase();
    const matchesSearch =
      title.toLowerCase().includes(searchText) ||
      content.toLowerCase().includes(searchText) ||
      author.toLowerCase().includes(searchText) ||
      tags.toLowerCase().includes(searchText);
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && date >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && date <= endDate;
    }
    return matchesSearch && matchesDate;
  });
  const totalPages = Math.max(1, Math.ceil(filteredNews.length / pageSize));
  const pagedNews = filteredNews.slice((page - 1) * pageSize, page * pageSize);

  // Reset to page 1 if search or filter changes and current page is out of range
  React.useEffect(() => {
    if ((page - 1) * pageSize >= filteredNews.length) {
      setPage(1);
    }
  }, [search, startDate, endDate, filteredNews.length]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10">
      <div className="w-[95vw] max-w-8xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <h1 className="text-5xl md:text-6xl font-serif font-semibold text-gray-900 dark:text-gray-50 mb-12 text-center tracking-tight">
          {tNews.news || "News"}
        </h1>
        {/* Search and date filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex-1 flex justify-end">
            <input
              type="text"
              className="w-full max-w-md px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-800 dark:text-white text-lg shadow"
              placeholder={tNews.searchPlaceholder || "ค้นหาข่าว..."}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex flex-row gap-2 justify-center">
            <input
              type="date"
              className="px-3 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-800 dark:text-white text-base shadow"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              max={endDate || new Date().toISOString().slice(0, 10)}
            />
            <span className="text-gray-500 dark:text-gray-400 flex items-center">
              -
            </span>
            <input
              type="date"
              className="px-3 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-800 dark:text-white text-base shadow"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              min={startDate || undefined}
              max={new Date().toISOString().slice(0, 10)}
            />
          </div>
        </div>
        {loading ? (
          <div className="space-y-8">
            {[...Array(pageSize)].map((_, idx) => (
              <div
                key={idx}
                className="flex gap-6 items-start bg-white/60 dark:bg-gray-900/60 rounded-lg border border-gray-100 dark:border-gray-800 p-6 animate-pulse"
              >
                <div className="h-28 w-44 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-lg text-red-600 dark:text-red-300 py-16">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {pagedNews.length === 0 ? (
              <div className="text-center text-gray-400 dark:text-gray-500 text-xl py-16">
                {tNews.notFound || "ไม่พบข่าวที่ค้นหา"}
              </div>
            ) : (
              pagedNews.map((news, idx) => (
                <Link
                  key={news.news_id || news.id || idx}
                  href={`/news/${news.news_id || news.id || idx}`}
                  prefetch={false}
                  className="block"
                >
                  <article className="flex flex-col md:flex-row gap-6 items-start bg-white/60 dark:bg-gray-900/60 rounded-lg border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg transition-transform duration-200 ease-out transform-gpu hover:-translate-y-1">
                    <div className="h-44 w-full md:w-56 flex-shrink-0 bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-lg shadow-sm">
                      {news.img_url ? (
                        <img
                          src={news.img_url}
                          alt={news.title}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-red-600">
                          <svg
                            width="40"
                            height="40"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <rect
                              width="24"
                              height="24"
                              rx="4"
                              fill="#fff1f2"
                            />
                            <path
                              d="M7 17l3.5-4.5 2.5 3 3.5-4.5 4 6H3l4-6z"
                              fill="#e11d48"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3 gap-4">
                        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-gray-900 dark:text-gray-50 leading-tight">
                          {news.title}
                        </h2>
                        <div className="text-sm text-gray-400 dark:text-gray-500 tracking-wide">
                          {news.published_at
                            ? String(news.published_at).slice(0, 10)
                            : news.date || "-"}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {news.author && (
                          <span className="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wide">
                            {news.author}
                          </span>
                        )}
                        {Array.isArray(news.tags)
                          ? news.tags.map((tag: string, i: number) => (
                              <span
                                key={i}
                                className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded"
                              >
                                #{tag}
                              </span>
                            ))
                          : null}
                      </div>
                      <p
                        className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {news.content}
                      </p>
                      <div className="flex justify-end">
                        <span className="text-xs text-gray-400 italic">
                          #{(page - 1) * pageSize + idx + 1}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))
            )}
          </div>
        )}
        {/* Pagination controls */}
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold text-lg hover:bg-red-700 transition disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            &lt; {tNews.prev || "Prev"}
          </button>
          <span className="mx-2 text-lg font-bold text-red-700 dark:text-red-300">
            {page} / {totalPages}
          </span>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold text-lg hover:bg-red-700 transition disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            {tNews.next || "Next"} &gt;
          </button>
        </div>
      </div>
    </main>
  );
}
