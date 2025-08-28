"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";
import ApiService from "@/utils/ApiService";
import Image from "next/image";

// Remove initialNews, fetch from backend in real app

export default function NewsManagePage() {
  const { language } = useLanguage();
  const t = translations[language].newsmanage;
  const [newsList, setNewsList] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    title: "",
    date: "",
    content: "",
    img: "",
    imgFile: null,
    tags: "",
    author: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchNews() {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getAllNews();
      if (res.success) {
        setNewsList(res.data || []);
      } else {
        setError(res.message || "ไม่สามารถโหลดข่าวได้");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target as HTMLInputElement;
    if (name === "img") {
      const input = e.target as HTMLInputElement;
      const file = input.files && input.files[0] ? input.files[0] : null;
      setForm((prev: any) => ({
        ...prev,
        imgFile: file,
        img: file ? URL.createObjectURL(file) : prev.img,
      }));
    } else {
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  }

  async function handleAddNews(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const tagsArr = form.tags
        ? form.tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];
      if (editingId) {
        const payload: any = {
          title: form.title,
          content: form.content,
          author: form.author,
          tags: tagsArr.join(","),
          published_at: form.date,
        };
        if (form.imgFile) payload.img = form.imgFile;
        const res = await ApiService.updateNews(editingId, payload);
        if (res.success) {
          setSuccess("บันทึกการแก้ไขข่าวสำเร็จ");
          await fetchNews();
          setEditingId(null);
        } else {
          setError(res.message || "เกิดข้อผิดพลาดในการแก้ไขข่าว");
        }
      } else {
        const payload: any = {
          title: form.title,
          content: form.content,
          author: form.author,
          tags: tagsArr,
          published_at: form.date,
        };
        if (form.imgFile) payload.img = form.imgFile;
        const res = await ApiService.addNews(payload);
        if (res.success) {
          setSuccess("เพิ่มข่าวสำเร็จ");
          await fetchNews();
        } else {
          setError(res.message || "เกิดข้อผิดพลาดในการเพิ่มข่าว");
        }
      }
      setForm({
        title: "",
        date: "",
        content: "",
        img: "",
        imgFile: null,
        tags: "",
        author: form.author,
      });
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข่าวนี้?")) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await ApiService.deleteNews(id);
      if (res.success) {
        setNewsList((prev) => prev.filter((n) => (n.news_id || n.id) !== id));
        setSuccess("ลบข่าวสำเร็จ");
      } else {
        setError(res.message || "เกิดข้อผิดพลาดในการลบข่าว");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-[90vw] max-w-4xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mt-30 mb-30">
        <h1 className="text-3xl font-extrabold text-red-700 dark:text-red-300 mb-6 text-center">
          {t.newsManage}
        </h1>
        <form
          className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleAddNews}
        >
          {error && (
            <div className="md:col-span-2 text-red-600 text-center font-semibold mb-2">
              {error}
            </div>
          )}
          {success && (
            <div className="md:col-span-2 text-green-600 text-center font-semibold mb-2">
              {success}
            </div>
          )}
          {loading && (
            <div className="md:col-span-2 text-center text-gray-500">
              กำลังเพิ่มข่าว...
            </div>
          )}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
              ผู้เขียน (Author)
            </label>
            <input
              type="text"
              name="author"
              placeholder="ชื่อผู้เขียน"
              value={form.author}
              readOnly
              className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
              แท็ก (Tags, คั่นด้วย ,)
            </label>
            <input
              type="text"
              name="tags"
              placeholder="ข่าว,โปรโมชั่น,สินค้าใหม่"
              value={form.tags}
              onChange={handleChange}
              className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
              {t.newsTitle}
            </label>
            <input
              type="text"
              name="title"
              placeholder={t.newsTitle}
              value={form.title}
              onChange={handleChange}
              className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
              {t.newsDate}
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
              {t.newsImage}
            </label>
            <input
              type="file"
              name="img"
              accept="image/*"
              onChange={handleChange}
              className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            {form.img && (
              <img
                src={form.img}
                alt="preview"
                className="rounded-lg max-h-50 mb-2 object-cover w-full"
                width={500}
                height={300}
              />
            )}
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
              {t.newsContent}
            </label>
            <textarea
              name="content"
              placeholder={t.newsContent}
              value={form.content}
              onChange={handleChange}
              className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[80px]"
              required
            />
          </div>
          <div className="flex gap-2 col-span-1 md:col-span-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold rounded-lg shadow-lg transition-all text-lg"
            >
              {editingId ? "บันทึกการแก้ไข" : t.addNews}
            </button>
            {editingId && (
              <button
                type="button"
                className="flex-1 py-3 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg shadow-lg transition-all text-lg"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    title: "",
                    date: "",
                    content: "",
                    img: "",
                    imgFile: null,
                    tags: "",
                    author: form.author,
                  });
                }}
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>
        <div className="mb-4">
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            {t.allNewsList}
          </span>
        </div>
        {loading ? (
          <div className="w-full flex justify-center items-center py-8">
            <span className="text-gray-500 dark:text-gray-400 text-lg animate-pulse">
              กำลังโหลดข้อมูลข่าว...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsList.map((news) => (
              <article
                key={news.news_id || news.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                <Link
                  href={`/admin/news-manage/${news.news_id || news.id}`}
                  className="block p-4 flex-1"
                  prefetch={false}
                >
                  {
                    <div className="mb-3 h-40 w-full overflow-hidden rounded">
                      <img
                        src={news.img_url || news.img || "/224x176.png"}
                        alt="news"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  }
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">
                    {news.title}
                  </h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {news.published_at
                      ? news.published_at.slice(0, 10)
                      : news.date}
                    {news.author && (
                      <span className="ml-2">โดย {news.author}</span>
                    )}
                  </div>
                  {news.tags && (
                    <div className="mb-2">
                      {(Array.isArray(news.tags)
                        ? news.tags
                        : typeof news.tags === "string"
                        ? news.tags.split(",")
                        : []
                      ).map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="inline-block bg-red-100 dark:bg-gray-700 text-red-600 dark:text-red-300 rounded px-2 py-0.5 mr-1 text-xs"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-gray-700 dark:text-gray-200 line-clamp-3 mt-2">
                    {news.content}
                  </p>
                </Link>
                <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {news.reads ? `${news.reads} views` : ""}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(news.news_id || news.id);
                        setForm({
                          title: news.title || "",
                          date: news.published_at
                            ? news.published_at.slice(0, 10)
                            : news.date || "",
                          content: news.content || "",
                          img: news.img_url || news.img || "",
                          imgFile: null,
                          tags: Array.isArray(news.tags)
                            ? news.tags.join(", ")
                            : typeof news.tags === "string"
                            ? news.tags
                            : "",
                          author: news.author || "",
                        });
                      }}
                      className="text-blue-600 dark:text-blue-400 font-bold text-sm px-3 py-1 rounded-lg bg-blue-100 dark:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600 transition"
                      title="แก้ไขข่าว"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(news.news_id || news.id)}
                      className="text-red-600 dark:text-red-400 font-bold text-sm hover:scale-110 transition-transform bg-transparent"
                      title={t.deleteNews}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
