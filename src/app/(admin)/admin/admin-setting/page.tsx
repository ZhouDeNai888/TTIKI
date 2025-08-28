"use client";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";

import React, { useState, useEffect } from "react";

export default function AdminSetting() {
  const { language, setLanguage } = useLanguage();
  const t = (translations as any)[language].adminsetting;
  const [storeName, setStoreName] = useState("TTKI Truck Parts");
  const [adminEmail, setAdminEmail] = useState("admin@ttki.com");
  const [theme, setTheme] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState("");

  // On mount, load theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") setTheme(saved);
    else setTheme("light");
  }, []);

  // Theme effect: update <html> class and persist to localStorage
  useEffect(() => {
    if (!theme) return;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  // ใน render: ถ้า theme ยัง undefined ให้ return null หรือ skeleton
  if (theme === undefined) return null;

  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 mt-43 mb-84">
      <h2 className="text-2xl font-extrabold text-red-700 dark:text-red-300 mb-6 text-center">
        {t.title}
      </h2>
      <form className="flex flex-col gap-6">
        <div>
          <label className="block text-lg font-bold mb-2 text-gray-700 dark:text-gray-200">
            {t.theme}
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="light">{t.themeLight}</option>
            <option value="dark">{t.themeDark}</option>
          </select>
        </div>
        <div>
          <label className="block text-lg font-bold mb-2 text-gray-700 dark:text-gray-200">
            {t.language}
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setLanguage("th")}
              className={`px-4 py-2 rounded-lg font-bold border transition ${
                language === "th"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700"
              }`}
            >
              ไทย
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-4 py-2 rounded-lg font-bold border transition ${
                language === "en"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700"
              }`}
            >
              English
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
