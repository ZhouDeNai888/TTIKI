"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";
import ApiService from "@/utils/ApiService";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // หรือธีมอื่น

export default function NewsDetailPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const tNewsDetails = t.newsdetails || {};
  const params = useParams();
  const id = Number(params?.news_id);
  const [newsDetail, setNewsDetail] = React.useState<any>(null);
  const [newsMeta, setNewsMeta] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [detailRes, metaRes] = await Promise.all([
          ApiService.getNewsDetailById(id),
          ApiService.getNewsById(id),
        ]);
        if (detailRes.success && detailRes.data) {
          setNewsDetail(detailRes.data);
        } else {
          setError(
            detailRes.message || tNewsDetails.notFound || "ไม่พบข่าวนี้"
          );
        }
        if (metaRes.success && metaRes.data) {
          setNewsMeta(metaRes.data);
        }
      } catch (err: any) {
        setError(err.message || tNewsDetails.notFound || "ไม่พบข่าวนี้");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchAll();
  }, [id]);

  // Merge fields from detail and meta
  const meta = newsMeta || {};
  const detail = newsDetail || {};
  const date =
    detail.published_at || meta.published_at
      ? String(detail.published_at || meta.published_at).slice(0, 10)
      : detail.date || meta.date || "-";
  const newsId = detail.news_id || meta.news_id || detail.id || meta.id || id;
  const tags = Array.isArray(detail.tags)
    ? detail.tags
    : typeof detail.tags === "string"
    ? detail.tags.split(",")
    : Array.isArray(meta.tags)
    ? meta.tags
    : typeof meta.tags === "string"
    ? meta.tags.split(",")
    : [];
  const author = detail.author || meta.author || "";
  const title = detail.title || meta.title || "";
  const content = detail.content || meta.content || "";
  const images: string[] = Array.isArray(detail.image_urls)
    ? detail.image_urls
    : Array.isArray(detail.image)
    ? detail.image.map((img: string) =>
        img.startsWith("data:image/")
          ? img
          : `${
              process.env.NEXT_PUBLIC_API_BASE
                ? process.env.NEXT_PUBLIC_API_BASE.replace(/\/$/, "")
                : ""
            }/${img.replace(/\\/g, "/")}`
      )
    : Array.isArray(meta.image_urls)
    ? meta.image_urls
    : Array.isArray(meta.image)
    ? meta.image.map((img: string) =>
        img.startsWith("data:image/")
          ? img
          : `${
              process.env.NEXT_PUBLIC_API_BASE
                ? process.env.NEXT_PUBLIC_API_BASE.replace(/\/$/, "")
                : ""
            }/${img.replace(/\\/g, "/")}`
      )
    : [];

  // Carousel state: index, autoplay and pause-on-user-interaction
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const isPausedRef = React.useRef(false);
  const resumeTimeoutRef = React.useRef<number | null>(null);

  const pauseAutoplay = (ms = 8000) => {
    isPausedRef.current = true;
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current as number);
    }
    resumeTimeoutRef.current = window.setTimeout(() => {
      isPausedRef.current = false;
      resumeTimeoutRef.current = null;
    }, ms) as unknown as number;
  };

  // Autoplay effect
  React.useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = window.setInterval(() => {
      if (!isPausedRef.current) {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
    }, 4000);
    return () => {
      window.clearInterval(interval as number);
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current as number);
        resumeTimeoutRef.current = null;
      }
    };
  }, [images]);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10">
        <div className="w-full max-w-7xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-10 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="mb-6 flex flex-wrap gap-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-32 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg"
              />
            ))}
          </div>
          <div className="prose prose-lg dark:prose-invert text-lg mb-8 max-w-none">
            <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          </div>
          <div className="inline-block mt-4 px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-white font-bold text-lg" />
        </div>
      </main>
    );
  }
  if (error || !newsDetail) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center text-2xl text-red-600 dark:text-red-300 font-bold">
          {error || tNewsDetails.notFound || "ไม่พบข่าวนี้"}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10">
      <article className="w-full max-w-7xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow p-8">
        {/* Hero image (first image) + thumbnail gallery for additional images */}
        {images.length > 0 && (
          <div className="mb-6">
            <div className="mb-4 overflow-hidden rounded-lg">
              <img
                src={images[currentIndex]}
                alt={`hero-${currentIndex}`}
                className="w-full h-64 md:h-96 object-cover cursor-pointer"
                onClick={() => {
                  // Pause autoplay briefly when user clicks hero
                  pauseAutoplay(8000);
                }}
              />
            </div>

            {images.length > 1 && (
              <div
                className="flex gap-3 overflow-x-auto py-1 [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
              >
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`thumb-${idx}`}
                    onClick={() => {
                      setCurrentIndex(idx);
                      pauseAutoplay(10000);
                    }}
                    className={`flex-shrink-0 w-28 h-20 md:w-36 md:h-24 object-cover rounded-md border ${
                      idx === currentIndex
                        ? "border-red-500 ring-2 ring-red-200 dark:ring-red-900"
                        : "border-gray-100 dark:border-gray-700"
                    } cursor-pointer transition-all`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-3 text-center">
          {title}
        </h1>

        {/* Meta row */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <div className="px-3 py-1 bg-red-50 dark:bg-gray-800 text-red-600 dark:text-red-300 rounded-full font-semibold">
            {tNewsDetails.date ? `${tNewsDetails.date}: ${date}` : date}
          </div>
          {author && <div className="text-sm">{author}</div>}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {tags.map((tag: string, i: number) => (
                <span
                  key={i}
                  className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert text-lg mb-8 mx-auto max-w-2xl">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Footer / back link */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {newsId ? `ID: ${newsId}` : ""}
          </div>
          <a
            href="/news"
            className="text-red-600 dark:text-red-400 font-semibold hover:underline"
          >
            {tNewsDetails.return || "ย้อนกลับ"}
          </a>
        </div>
      </article>
    </main>
  );
}
