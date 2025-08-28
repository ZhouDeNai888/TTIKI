"use client";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";

import React from "react";
import ApiService from "@/utils/ApiService";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

export default function NewsManageDetailPage() {
  const { language } = useLanguage();
  const t = translations[language].newsdetailmanage;
  const params = useParams();
  const id = Number(params?.news_id);
  const router = useRouter();
  const [form, setForm] = React.useState({
    title: "",
    date: "",
    content: "",
    images: [] as string[],
  });
  // Carousel / preview state
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
  // Track if news detail exists and its id
  const [hasDetail, setHasDetail] = React.useState(false);
  const [newsDetailId, setNewsDetailId] = React.useState<number | null>(null);
  const [newsMeta, setNewsMeta] = React.useState({
    title: "",
    published_at: "",
    tags: "",
    author: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setError(null);
      try {
        // Fetch meta info
        const res = await ApiService.getNewsById(id);
        if (res.success && res.data) {
          setNewsMeta({
            title: res.data.title || "",
            published_at: res.data.published_at || "",
            tags: Array.isArray(res.data.tags)
              ? res.data.tags.join(", ")
              : typeof res.data.tags === "string"
              ? res.data.tags
              : "",
            author: res.data.author || "",
          });
        } else {
          setError(res.message || "ไม่พบข่าวนี้");
          setLoading(false);
          return;
        }

        // Fetch detail info (content, images)
        const detailRes = await ApiService.getNewsDetailById(id);
        if (detailRes.success && detailRes.data) {
          // Prefer image_urls if present, else fallback to image
          let images: string[] = [];
          if (Array.isArray(detailRes.data.image_urls)) {
            images = detailRes.data.image_urls;
          } else if (Array.isArray(detailRes.data.image)) {
            images = detailRes.data.image.map((img: string) =>
              img.startsWith("data:image/")
                ? img
                : `${
                    process.env.NEXT_PUBLIC_API_BASE
                      ? process.env.NEXT_PUBLIC_API_BASE.replace(/\/$/, "")
                      : ""
                  }/${img.replace(/\\/g, "/")}`
            );
          }
          setForm((prev) => ({
            ...prev,
            content: detailRes.data.content || "",
            images,
          }));
          setHasDetail(true);
          setNewsDetailId(detailRes.data.news_detail_id || null);
        } else {
          setHasDetail(false);
          setNewsDetailId(null);
        }
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchNews();
  }, [id]);

  // Autoplay for admin preview carousel
  React.useEffect(() => {
    const images = form.images || [];
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
  }, [form.images]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (e.target.type === "file") {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const readers = Array.from(files).map(
          (file) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            })
        );
        Promise.all(readers).then((images) => {
          setForm((prev) => ({ ...prev, images: [...prev.images, ...images] }));
        });
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Convert all images (base64 or URL) to File objects
      let images: File[] = [];
      if (form.images && form.images.length > 0) {
        images = (
          await Promise.all(
            form.images.map(async (img: string | File, idx: number) => {
              if (typeof img === "string" && img.startsWith("data:image/")) {
                // base64 -> File
                const res = await fetch(img);
                const blob = await res.blob();
                const match = img.match(/^data:image\/(\w+);/);
                const ext = match ? match[1] : "png";
                return new File([blob], `image_${idx}.${ext}`, {
                  type: blob.type,
                });
              } else if (
                typeof img === "string" &&
                (img.startsWith("http://") || img.startsWith("https://"))
              ) {
                // URL -> fetch -> File
                const res = await fetch(img);
                const blob = await res.blob();
                // Try to get extension from url
                const urlExt = img.split(".").pop()?.split("?")[0] || "jpg";
                return new File([blob], `image_${idx}.${urlExt}`, {
                  type: blob.type || `image/${urlExt}`,
                });
              } else if (img instanceof File) {
                return img;
              }
              return null;
            })
          )
        ).filter((f): f is File => f instanceof File);
      }
      let payload: any = {
        content: form.content,
        images: images.length > 0 ? images : undefined,
      };
      let res;
      if (hasDetail && newsDetailId) {
        // For update, include news_id in payload
        res = await ApiService.updateNewsDetail(newsDetailId, {
          ...payload,
          news_id: id,
        });
      } else {
        // For add, do not duplicate news_id in payload (addNewsDetail expects it at top level)
        res = await ApiService.addNewsDetail({ news_id: id, ...payload });
      }
      if (res.success) {
        router.push("/admin/news-manage");
      } else {
        setError(res.message || "เกิดข้อผิดพลาดในการบันทึกข่าว");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข่าว");
    } finally {
      setLoading(false);
    }
  }

  // Delete handler (dummy, implement actual API if available)
  async function handleDelete() {
    if (!window.confirm("คุณต้องการลบรายละเอียดข่าวนี้หรือไม่?")) return;
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement delete API for news detail if available
      // For now, just simulate success
      // const res = await ApiService.deleteNewsDetail(id);
      // if (res.success) {
      //   router.push("/admin/news-manage");
      // } else {
      //   setError(res.message || "เกิดข้อผิดพลาดในการลบข่าว");
      // }
      setTimeout(() => {
        setLoading(false);
        router.push("/admin/news-manage");
      }, 800);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการลบข่าว");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10">
      {loading ? (
        <div className="text-center text-lg text-gray-500 dark:text-gray-300">
          กำลังโหลดข้อมูลข่าว...
        </div>
      ) : error ? (
        <div className="text-center text-lg text-red-600 dark:text-red-300">
          {error}
        </div>
      ) : (
        <>
          {/* meta info moved to below */}
          <form
            onSubmit={handleSave}
            className="w-full max-w-7xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mt-30 mb-30"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left: Title (top), Content (bottom) */}
              <div className="md:col-span-2 flex flex-col">
                {/* Hero + thumbnails (live preview) */}
                {
                  <div className="mb-6">
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img
                        src={form.images[currentIndex] || "/1216X384.png"}
                        alt={`hero-${currentIndex}`}
                        className="w-full h-64 md:h-96 object-cover cursor-pointer"
                        onClick={() => {
                          pauseAutoplay(8000);
                        }}
                      />
                    </div>

                    {form.images.length > 1 && (
                      <div className="flex gap-3 overflow-x-auto py-1">
                        {form.images.map((img, idx) => (
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
                }

                <div className="flex items-center gap-4 mb-6 text-base flex-wrap">
                  <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {newsMeta.published_at
                      ? newsMeta.published_at.slice(0, 10)
                      : "-"}
                  </div>

                  <span className="font-semibold text-gray-700 dark:text-gray-200 mx-2">
                    รหัสข่าว:{" "}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">{id}</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-200 mx-2">
                    โดย:{" "}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {newsMeta.author || "-"}
                  </span>
                  <span className="font-semibold text-gray-700 dark:text-gray-200 mx-2">
                    แท็ก:{" "}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {newsMeta.tags || "-"}
                  </span>
                </div>

                <div className="text-3xl font-extrabold text-red-700 dark:text-red-300 mb-2 leading-tight">
                  {newsMeta.title || "-"}
                </div>

                {/* Editor (textarea) */}
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder={t.newsContent}
                  className="text-gray-700 dark:text-gray-200 text-lg mb-4 whitespace-pre-line bg-white dark:bg-gray-800 border border-red-200 dark:border-gray-700 rounded px-2 py-1 min-h-[140px]"
                  required
                />

                {/* Live preview rendered like main page */}
                <div className="prose prose-lg dark:prose-invert text-lg mb-8 mx-auto max-w-2xl">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                  >
                    {form.content || "(ยังไม่มีเนื้อหา)"}
                  </ReactMarkdown>
                </div>
              </div>
              {/* Right: Image upload and preview (1/3 column) */}
              <div className="md:col-span-1 flex flex-col items-start gap-4 sticky top-24 self-start">
                <div className="w-full flex flex-col items-stretch">
                  <div className="w-full flex flex-col gap-4">
                    {form.images && form.images.length > 0 ? (
                      form.images.map((img: string, idx: number) => {
                        // Horizontal card: square thumbnail (left), title (center), delete (right)
                        const label = img.startsWith("data:")
                          ? `รูป ${idx + 1}`
                          : img.split("/").pop()?.split("?")[0] ||
                            `รูป ${idx + 1}`;
                        return (
                          <div
                            key={idx}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-2 flex items-center gap-3"
                          >
                            <div className="flex-shrink-0 w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                              <img
                                src={img}
                                alt={`news-img-${idx}`}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                {label}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {typeof img === "string" && img.length > 60
                                  ? img.slice(0, 60) + "..."
                                  : img}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <button
                                type="button"
                                className="flex items-center justify-center w-9 h-9 bg-white/90 hover:bg-red-600 border-2 border-white hover:border-red-700 text-red-600 hover:text-white rounded-full shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                                title={t.deleteImage}
                                onClick={() =>
                                  setForm((prev) => ({
                                    ...prev,
                                    images: prev.images.filter(
                                      (_: string, i: number) => i !== idx
                                    ),
                                  }))
                                }
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M6 6l8 8M14 6l-8 8"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-gray-400">{t.noImages}</span>
                    )}
                  </div>
                  <input
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={handleChange}
                    className="w-full px-2 py-1 rounded border border-red-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mt-2"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-8">
              {hasDetail ? (
                <>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-yellow-600 text-white font-bold text-lg hover:bg-yellow-700 transition"
                  >
                    บันทึกแก้ไข
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-6 py-2 rounded-lg bg-red-600 text-white font-bold text-lg hover:bg-red-700 transition"
                  >
                    ลบ
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition"
                >
                  {t.save}
                </button>
              )}
              <a
                href="/admin/news-manage"
                className="px-6 py-2 rounded-lg bg-gray-400 text-white font-bold text-lg hover:bg-gray-500 transition"
              >
                {t.back}
              </a>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
