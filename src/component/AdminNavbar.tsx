"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminNotify } from "@/context/AdminNotifyContext";

const AdminNavbar: React.FC = () => {
  // Admin info from cookie
  const [admin, setAdmin] = React.useState<any | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [hasAdminCookie, setHasAdminCookie] = React.useState<boolean | null>(
    null
  );
  const { language } = useLanguage();
  const t = translations[language].adminnavbar;
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
    const checkAdminCookie = () => {
      if (typeof window !== "undefined" && typeof document !== "undefined") {
        const match = document.cookie.match(/admin=([^;]+)/);

        const hasCookie = !!match;
        setHasAdminCookie(hasCookie);
        if (!hasCookie && pathname !== "/admin") {
          router.push("/admin");
        }
        if (hasCookie) {
          try {
            // Expecting cookie value to be JSON string
            const decoded = decodeURIComponent(match[1]);
            setAdmin(JSON.parse(decoded));
          } catch (e) {
            setAdmin(null);
          }
        } else {
          setAdmin(null);
        }
      }
    };
    checkAdminCookie();
    const interval = setInterval(checkAdminCookie, 500);
    function getCurrentTheme(): "dark" | "light" {
      if (typeof window !== "undefined") {
        if (document.documentElement.classList.contains("dark")) return "dark";
        const stored = localStorage.getItem("theme");
        if (stored === "dark" || stored === "light") return stored;
      }
      return "light";
    }
    const currentTheme = getCurrentTheme();
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    return () => clearInterval(interval);
  }, [pathname, router]);

  // Responsive menu state
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { unreadCount } = useAdminNotify();
  const adminHasNewNotify = unreadCount > 0;

  if (!mounted || hasAdminCookie === null) return null;
  if (!hasAdminCookie && pathname !== "/admin") return null;

  return (
    <nav className="w-full py-4 px-4 sm:px-6 bg-red-800 dark:bg-gray-900 text-white flex items-center justify-between shadow-lg fixed top-0 left-0 z-50">
      <Link href="/admin/dashboard" className="flex items-center gap-2 group">
        <img
          src="/Logo.png"
          alt="TTKI Logo"
          className="h-10 w-10 sm:h-12 sm:w-13 p-1 group-hover:scale-105 transition-transform"
        />
        <span className="text-lg sm:text-xl font-extrabold tracking-wide group-hover:scale-105 transition-transform">
          {t.adminTitle}
        </span>
      </Link>
      {hasAdminCookie && (
        <>
          {/* Hamburger for sm/md */}
          <button
            className="cursor-pointer md:hidden flex items-center px-3 py-2 border rounded text-white border-red-300 dark:border-gray-700 hover:bg-red-900 dark:hover:bg-gray-700"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="เปิดเมนู"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {/* Menu for md/lg */}
          <div className="hidden md:flex gap-6 items-center">
            <Link href="/admin/dashboard" className="hover:underline font-bold">
              {t.dashboard}
            </Link>
            <Link
              href="/admin/item-code-manage"
              className="hover:underline font-bold"
            >
              {t.itemCodeManage ?? "Item Code Manage"}
            </Link>
            <Link
              href="/admin/items-manage"
              className="hover:underline font-bold"
            >
              {t.products}
            </Link>
            <Link
              href="/admin/price-manage"
              className="hover:underline font-bold"
            >
              {t.priceManage}
            </Link>
            <Link
              href="/admin/order-manage"
              className="hover:underline font-bold"
            >
              {t.orders}
            </Link>

            <Link
              href="/admin/users-manage"
              className="hover:underline font-bold"
            >
              {t.users}
            </Link>

            <Link
              href="/admin/news-manage"
              className="hover:underline font-bold"
            >
              {t.newsManage}
            </Link>
            <Link href="/admin/notify" className="hover:underline font-bold">
              <span className="inline-flex items-center gap-2">
                {t.notify ?? "Notify"}
                {adminHasNewNotify && (
                  <span className="inline-block w-2 h-2 bg-red-600 rounded-full" />
                )}
              </span>
            </Link>
            {/* <Link
              href="/admin/admin-setting"
              className="hover:underline font-bold"
            >
              {t.settings}
            </Link> */}
            {/* Profile dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl bg-red-700 dark:bg-gray-800 hover:bg-red-900 dark:hover:bg-gray-700 font-bold text-white transition-all duration-200"
              >
                <span className="inline-flex items-center justify-center rounded-full bg-red-100 dark:bg-gray-800 p-2">
                  {admin?.profile_picture_url ? (
                    <img
                      key={admin.profile_picture_url}
                      src={admin.profile_picture_url || admin.avatar}
                      alt="Admin Avatar"
                      className="h-6 w-6 rounded-full object-contain"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-700 dark:text-red-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A9.001 9.001 0 0112 15c2.21 0 4.21.805 5.879 2.146M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </span>
                <span className="hidden md:inline font-bold">{t.profile}</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-900 border border-red-100 dark:border-gray-700 rounded-xl shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 text-gray-900 dark:text-gray-100">
                <Link
                  href="/admin/profile"
                  className="block px-4 py-2 hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-900 dark:hover:text-red-200 rounded-lg transition-all"
                >
                  {t.profile}
                </Link>
                <Link
                  href="/admin/admin-setting"
                  className="block px-4 py-2 hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-900 dark:hover:text-red-200 rounded-lg transition-all"
                >
                  {t.settings}
                </Link>
                <a
                  href="#"
                  className="block px-4 py-2 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-gray-800 rounded-b-xl transition-all"
                  onClick={() => {
                    document.cookie = "admin=;path=/;max-age=0";
                    document.cookie = "aat=;path=/;max-age=0";
                    document.cookie = "arft=;path=/;max-age=0";
                    window.dispatchEvent(new Event("adminUpdated"));
                    window.location.href = "/admin";
                  }}
                >
                  {t.logout}
                </a>
              </div>
            </div>
          </div>
          {/* Mobile menu (sm/md) */}
          {menuOpen && (
            <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-t border-red-100 dark:border-gray-700 shadow-xl z-50 flex flex-col gap-2 py-4 px-4 text-gray-900 dark:text-gray-100 md:hidden">
              <Link
                href="/admin/dashboard"
                className="py-2 px-2 hover:bg-red-50 dark:hover:bg-gray-800 rounded font-bold"
                onClick={() => setMenuOpen(false)}
              >
                {t.dashboard}
              </Link>
              <Link
                href="/admin/item-code-manage"
                className="py-2 px-2 hover:bg-red-50 dark:hover:bg-gray-800 rounded font-bold"
                onClick={() => setMenuOpen(false)}
              >
                {t.itemCodeManage ?? "Item Code Manage"}
              </Link>
              <Link
                href="/admin/items-manage"
                className="py-2 px-2 hover:bg-red-50 dark:hover:bg-gray-800 rounded font-bold"
                onClick={() => setMenuOpen(false)}
              >
                {t.products}
              </Link>
              <Link
                href="/admin/order-manage"
                className="py-2 px-2 hover:bg-red-50 dark:hover:bg-gray-800 rounded font-bold"
                onClick={() => setMenuOpen(false)}
              >
                {t.orders}
              </Link>
              <Link
                href="/admin/notify"
                className="py-2 px-2 hover:bg-red-50 dark:hover:bg-gray-800 rounded font-bold"
                onClick={() => {
                  setMenuOpen(false);
                }}
              >
                <span className="inline-flex items-center gap-2">
                  {t.notify ?? "Notify"}
                  {adminHasNewNotify && (
                    <span className="inline-block w-2 h-2 bg-red-600 rounded-full" />
                  )}
                </span>
              </Link>
              <Link
                href="/admin/users-manage"
                className="py-2 px-2 hover:bg-red-50 dark:hover:bg-gray-800 rounded font-bold"
                onClick={() => setMenuOpen(false)}
              >
                {t.users}
              </Link>
              <Link
                href="/admin/price-manage"
                className="py-2 px-2 hover:bg-red-50 dark:hover:bg-gray-800 rounded font-bold"
                onClick={() => setMenuOpen(false)}
              >
                {t.priceManage}
              </Link>
              <Link
                href="/admin/news-manage"
                className="py-2 px-2 hover:bg-red-50 dark:hover:bg-gray-800 rounded font-bold"
                onClick={() => setMenuOpen(false)}
              >
                {t.newsManage}
              </Link>
              <Link
                href="/admin/admin-setting"
                className="py-2 px-2 hover:bg-red-50 dark:hover:bg-gray-800 rounded font-bold"
                onClick={() => setMenuOpen(false)}
              >
                {t.settings}
              </Link>
              {/* Profile dropdown for mobile */}
              <div className="border-t border-red-100 dark:border-gray-700 mt-2 pt-2">
                <Link
                  href="/admin/profile"
                  className="block px-4 py-2 hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-900 dark:hover:text-red-200 rounded-lg transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  {t.profile}
                </Link>
                <a
                  href="#"
                  className="block px-4 py-2 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-gray-800 rounded-b-xl transition-all"
                  onClick={() => {
                    document.cookie = "admin=;path=/;max-age=0";
                    document.cookie = "arft=;path=/;max-age=0";
                    window.dispatchEvent(new Event("adminUpdated"));
                    window.location.href = "/admin";
                  }}
                >
                  {t.logout}
                </a>
              </div>
            </div>
          )}
        </>
      )}
    </nav>
  );
};

export default AdminNavbar;
