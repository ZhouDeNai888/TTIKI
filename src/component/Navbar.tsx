"use client";
import React, { useEffect, useState } from "react";
import { useNotify } from "@/context/NotifyContext";
import { usePathname } from "next/navigation";
import Cartmodal from "./Cartmodal";
import Link from "next/link";

import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";
import Image from "next/image";
const Navbar = () => {
  // ...existing code...
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const [showAccountDropdownMobile, setShowAccountDropdownMobile] =
    useState(false);
  // Click-away for mobile account dropdown
  useEffect(() => {
    if (!showAccountDropdownMobile) return;
    function handleClick(e: MouseEvent) {
      const dropdown = document.getElementById("mobile-account-dropdown");
      const btn = document.getElementById("mobile-account-btn");
      if (!dropdown || !btn) return;
      if (
        !dropdown.contains(e.target as Node) &&
        !btn.contains(e.target as Node)
      ) {
        setShowAccountDropdownMobile(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAccountDropdownMobile]);
  // For redirect after logout
  const router = require("next/navigation").useRouter();
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [isCheckout, setIsCheckout] = useState(false);
  const { unreadCount } = useNotify();
  const notifyCount = unreadCount;
  // Open a lightweight SSE in the navbar so the badge updates even when notify page isn't open.
  // ใช้ ref เก็บชุด id ที่เคยรับมาแล้ว เพื่อกันการ push ซ้ำ
  // const seenIdsRef = React.useRef<Set<string>>(new Set());

  // Notification state is provided by NotifyProvider via useNotify()

  function getCartCount() {
    if (typeof window === "undefined") return 0;
    try {
      const cartStr = localStorage.getItem("cart");
      if (!cartStr) return 0;
      const cart = JSON.parse(cartStr);
      return cart.reduce(
        (sum: number, item: any) => sum + (item.quantity || 0),
        0
      );
    } catch {
      return 0;
    }
  }

  useEffect(() => {
    setCartCount(getCartCount());
    const handler = () => setCartCount(getCartCount());
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, []);

  // User cookie logic
  function getUserFromCookieOrSession() {
    if (typeof window === "undefined") return null;
    // Fallback to cookie
    const match = document.cookie.match(/user=([^;]*)/);
    if (!match) return null;
    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch {
      return null;
    }
  }

  useEffect(() => {
    // Set user initially
    setUser(getUserFromCookieOrSession());

    // Handler for userUpdated event
    const handler = () => setUser(getUserFromCookieOrSession());

    window.addEventListener("userUpdated", handler);

    // Polling for real-time check every 2 seconds
    const interval = setInterval(() => {
      setUser(getUserFromCookieOrSession());
    }, 10000);

    return () => {
      window.removeEventListener("userUpdated", handler);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const tNavbar = t.navbar || {};

  const pathname = usePathname();
  useEffect(() => {
    setIsCheckout(pathname.startsWith("/check-out"));
  }, [pathname]);

  const image = user?.profile_picture_url || user?.avatar || null;
  // If the avatar is an external URL, route it through the same-origin proxy so Next's
  // image optimizer doesn't block the request. Otherwise use the local/path value.
  const imageSrc =
    typeof image === "string" && image.startsWith("http")
      ? `/api/proxy/image?src=${encodeURIComponent(image)}`
      : image || "/default-profile.jpg";

  return (
    <>
      <nav className="w-full sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-gray-900/80 border-b border-red-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" aria-label="Home" className="flex items-center gap-3">
            <img
              src="/Logo.png"
              alt="TTIKI Logo"
              className="h-10 w-auto rounded-xl p-1 cursor-pointer hover:scale-105 transition-transform duration-200"
            />

            {/* Hide company name on tablet (md) and below, show only on desktop (lg and up) */}
            <span className="hidden lg:inline text-2xl font-extrabold text-red-700 dark:text-red-300 tracking-tight drop-shadow-sm">
              TT (I.K.I.) Autoparts
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8">
            {/* Use desktop navbar layout for md and up (tablet and desktop) */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {/* ...existing code... */}
              <Link
                href="/"
                className="text-red-700 dark:text-red-300 hover:text-white hover:bg-red-600 dark:hover:bg-red-700 font-semibold px-3 py-2 rounded-lg transition-all duration-200"
              >
                {tNavbar.dashboard || "Home"}
              </Link>
              <Link
                href="/shop"
                className="text-red-700 dark:text-red-300 hover:text-white hover:bg-red-600 dark:hover:bg-red-700 font-semibold px-3 py-2 rounded-lg transition-all duration-200"
              >
                {tNavbar.products || "Shop"}
              </Link>
              <Link
                href="/news"
                className="text-red-700 dark:text-red-300 hover:text-white hover:bg-red-600 dark:hover:bg-red-700 font-semibold px-3 py-2 rounded-lg transition-all duration-200"
              >
                {tNavbar.news || "News"}
              </Link>
              <Link
                href="/contact"
                className="text-red-700 dark:text-red-300 hover:text-white hover:bg-red-600 dark:hover:bg-red-700 font-semibold px-3 py-2 rounded-lg transition-all duration-200"
              >
                {tNavbar.contactUs || "Contact"}
              </Link>

              <div className="flex items-center gap-2 ml-6">
                {/* Cart button, always visible and responsive */}
                <button
                  type="button"
                  className={`cursor-pointer relative group flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 dark:border-red-400 bg-white dark:bg-gray-900 transition-all duration-200 shadow-sm font-bold text-red-700 dark:text-red-300 md:px-0 md:py-0 md:bg-transparent md:border-none md:shadow-none ${
                    isCheckout
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-red-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => !isCheckout && setCartModalOpen(true)}
                  aria-label="Open cart"
                  disabled={isCheckout}
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 md:w-10 md:h-10 rounded-xl">
                    <svg
                      className="w-6 h-6 text-red-600 dark:text-red-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.6 17h8.8a1 1 0 00.95-1.3L17 13M7 13V6h13"
                      />
                    </svg>
                    {/* Cart count badge */}
                    <span className="absolute -top-2 -right-2 md:-top-1 md:-right-1 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow group-hover:bg-red-700">
                      {cartCount}
                    </span>
                  </span>
                  <span className="block md:hidden ml-1">
                    {tNavbar.cart || "Cart"}
                  </span>
                </button>
                {/* notifications moved into user dropdown */}
                {/* If user is logged in, show account icon, else show Sign In/Sign Up */}
                {user ? (
                  <div className="relative group">
                    <button
                      type="button"
                      className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 dark:border-red-400  hover:bg-red-50 dark:hover:bg-gray-800 transition-all duration-200 shadow-sm font-bold text-red-700 dark:text-red-300 md:px-0 md:py-0 md:bg-transparent md:border-none md:shadow-none"
                      aria-label="Account"
                    >
                      <span className="relative inline-flex items-center justify-center rounded-full bg-red-100 dark:bg-gray-800 p-2">
                        {user?.profile_picture_url ? (
                          <Image
                            key={imageSrc} // ensures re-render when URL changes
                            src={imageSrc}
                            alt="User Avatar"
                            className="h-6 w-6 rounded-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/default-profile.jpg";
                            }}
                            width={24}
                            height={24}
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
                        {notifyCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                            {notifyCount > 99 ? "99+" : notifyCount}
                          </span>
                        )}
                      </span>
                      <span className="hidden md:inline font-bold">
                        {user.username}
                      </span>
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
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border border-red-100 dark:border-gray-700 rounded-xl shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-b border-red-100 dark:border-gray-700">
                        {user.username || user.email}
                      </div>
                      <button
                        className="cursor-pointer font-bold dark:text-white text-black w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-900 dark:hover:text-red-200 transition-all"
                        onClick={() => router.push("/profile")}
                      >
                        {tNavbar.profile || "Profile"}
                      </button>
                      <button
                        className="cursor-pointer font-bold dark:text-white text-black w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-900 dark:hover:text-red-200 transition-all flex items-center justify-between"
                        onClick={() => router.push("/notify")}
                      >
                        <span>แจ้งเตือน</span>
                        {notifyCount > 0 && (
                          <span className="bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                            {notifyCount > 99 ? "99+" : notifyCount}
                          </span>
                        )}
                      </button>
                      <button
                        className="cursor-pointer font-bold dark:text-white text-black w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-900 dark:hover:text-red-200 transition-all"
                        onClick={() => router.push("/orders")}
                      >
                        {tNavbar.orders || "Orders"}
                      </button>
                      <button
                        className="cursor-pointer w-full text-left px-4 py-2 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-gray-800 rounded-b-xl transition-all"
                        onClick={() => {
                          document.cookie = "user=;path=/;max-age=0";
                          document.cookie = "urft=;path=/;max-age=0";
                          document.cookie = "uat=;path=/;max-age=0";
                          window.sessionStorage.removeItem("user");
                          window.dispatchEvent(new Event("userUpdated"));
                          router.push("/");
                        }}
                      >
                        {tNavbar.logout || "Logout"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className="px-3 py-1 md:px-5 md:py-2 text-red-700 dark:text-red-300 border border-red-600 dark:border-red-300 rounded-lg md:rounded-xl font-bold text-sm md:text-base hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-900 dark:hover:text-red-200 transition-all duration-200 shadow-sm whitespace-nowrap"
                    >
                      {tNavbar.signIn || "Sign In"}
                    </Link>
                    <Link
                      href="/signup"
                      className="px-3 py-1 md:px-5 md:py-2 bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 text-white rounded-lg md:rounded-xl font-bold text-sm md:text-base shadow-lg hover:scale-105 hover:from-red-700 hover:to-red-600 transition-all duration-200 whitespace-nowrap"
                    >
                      {tNavbar.signUp || "Sign Up"}
                    </Link>
                  </>
                )}
              </div>
            </div>
            {/* Dark mode toggle button (desktop only) */}
            <button
              onClick={toggleTheme}
              className="cursor-pointer hidden md:inline-flex p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  />
                </svg>
              )}
            </button>
            {/* Language select dropdown (desktop only) */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "th")}
              className="cursor-pointer  ml-2 px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 font-semibold focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200 hidden md:block"
              aria-label="Select language"
            >
              <option value="en">EN</option>
              <option value="th">TH</option>
            </select>
            {/* Mobile: Sign In/Sign Up beside menu toggle */}
            {/* Only show mobile layout below md (phones) */}
            <div className="flex md:hidden items-center gap-2">
              {/* Cart button (mobile), left of Sign In */}
              <button
                type="button"
                className={`cursor-pointer relative group flex items-center gap-2 px-2 py-1 rounded-lg border border-red-200 dark:border-red-400 bg-white dark:bg-gray-900 transition-all duration-200 shadow-sm font-bold text-red-700 dark:text-red-300 ${
                  isCheckout
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-red-50 dark:hover:bg-gray-800"
                }`}
                onClick={() => !isCheckout && setCartModalOpen(true)}
                aria-label="Open cart"
                disabled={isCheckout}
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg">
                  <svg
                    className="w-6 h-6 text-red-600 dark:text-red-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.6 17h8.8a1 1 0 00.95-1.3L17 13M7 13V6h13"
                    />
                  </svg>
                  {/* Cart count badge */}
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow group-hover:bg-red-700">
                    {cartCount}
                  </span>
                </span>
                <span className="block ml-1">{tNavbar.cart || "Cart"}</span>
              </button>
              {/* If user is logged in, show account icon, else show Sign In/Sign Up */}
              {user ? (
                <div className="relative">
                  <button
                    id="mobile-account-btn"
                    type="button"
                    className="cursor-pointer flex items-center gap-2 px-2 py-1 rounded-lg border border-red-200 dark:border-red-400 bg-white dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-gray-800 transition-all duration-200 shadow-sm font-bold text-red-700 dark:text-red-300"
                    aria-label="Account"
                    onClick={() => setShowAccountDropdownMobile((v) => !v)}
                  >
                    <span className="relative inline-flex items-center justify-center rounded-full bg-red-100 dark:bg-gray-800 p-2">
                      {user?.profile_picture_url ? (
                        <Image
                          key={imageSrc} // ensures re-render when URL changes
                          src={imageSrc}
                          alt="User Avatar"
                          className="h-6 w-6 rounded-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/default-profile.jpg";
                          }}
                          width={24}
                          height={24}
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
                      {notifyCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                          {notifyCount > 99 ? "99+" : notifyCount}
                        </span>
                      )}
                    </span>
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
                  {/* Mobile dropdown: show on click, not hover */}
                  {showAccountDropdownMobile && (
                    <div
                      id="mobile-account-dropdown"
                      className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border border-red-100 dark:border-gray-700 rounded-xl shadow-xl z-50 transition-all duration-300"
                    >
                      <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-b border-red-100 dark:border-gray-700">
                        {user.username || user.email}
                      </div>
                      <button
                        className="cursor-pointer font-bold dark:text-white text-black w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-900 dark:hover:text-red-200 transition-all"
                        onClick={() => {
                          setShowAccountDropdownMobile(false);
                          router.push("/profile");
                        }}
                      >
                        {tNavbar.profile || "Profile"}
                      </button>
                      <button
                        className="cursor-pointer font-bold dark:text-white text-black w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-900 dark:hover:text-red-200 transition-all flex items-center justify-between"
                        onClick={() => {
                          setShowAccountDropdownMobile(false);
                          router.push("/notify");
                        }}
                      >
                        <span>แจ้งเตือน</span>
                        {notifyCount > 0 && (
                          <span className="bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                            {notifyCount > 99 ? "99+" : notifyCount}
                          </span>
                        )}
                      </button>
                      <button
                        className="cursor-pointer font-bold dark:text-white text-black w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-900 dark:hover:text-red-200 transition-all"
                        onClick={() => {
                          setShowAccountDropdownMobile(false);
                          router.push("/orders");
                        }}
                      >
                        {tNavbar.orders || "Orders"}
                      </button>
                      <button
                        className="cursor-pointer w-full text-left px-4 py-2 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-gray-800 rounded-b-xl transition-all"
                        onClick={() => {
                          setShowAccountDropdownMobile(false);
                          document.cookie = "user=;path=/;max-age=0";
                          document.cookie = "urft=;path=/;max-age=0";
                          document.cookie = "uat=;path=/;max-age=0";
                          window.dispatchEvent(new Event("userUpdated"));
                          router.push("/");
                        }}
                      >
                        {tNavbar.logout || "Logout"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="px-3 py-1 text-red-700 dark:text-red-300 border border-red-600 dark:border-red-300 rounded-lg font-bold text-sm hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-900 dark:hover:text-red-200 transition-all duration-200"
                  >
                    {tNavbar.signIn || "Sign In"}
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 text-white rounded-lg font-bold text-sm shadow-lg hover:scale-105 hover:from-red-700 hover:to-red-600 transition-all duration-200"
                  >
                    {tNavbar.signUp || "Sign Up"}
                  </Link>
                </>
              )}
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                className="cursor-pointer text-red-700 dark:text-red-300 hover:text-white hover:bg-red-600 dark:hover:bg-red-700 p-2 rounded-lg focus:outline-none transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Open mobile menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile menu dropdown outside nav for full screen overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-0 left-0 w-full bg-white dark:bg-gray-900 border-b border-red-200 dark:border-gray-700 shadow-lg animate-slide-down">
            <button
              className="cursor-pointer absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-full focus:outline-none transition"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <nav className="flex flex-col gap-4 pt-16 pb-8 px-6 items-start">
              <Link
                href="/"
                className="text-red-700 dark:text-red-300 hover:text-white hover:bg-red-600 dark:hover:bg-red-700 font-bold text-lg px-4 py-3 rounded-lg transition-all duration-200 text-left w-full"
              >
                {tNavbar.dashboard || "Home"}
              </Link>
              <Link
                href="/shop"
                className="text-red-700 dark:text-red-300 hover:text-white hover:bg-red-600 dark:hover:bg-red-700 font-bold text-lg px-4 py-3 rounded-lg transition-all duration-200 text-left w-full"
              >
                {tNavbar.products || "Shop"}
              </Link>
              <Link
                href="/news"
                className="text-red-700 dark:text-red-300 hover:text-white hover:bg-red-600 dark:hover:bg-red-700 font-bold text-lg px-4 py-3 rounded-lg transition-all duration-200 text-left w-full"
              >
                {tNavbar.news || "News"}
              </Link>
              <Link
                href="/contact"
                className="text-red-700 dark:text-red-300 hover:text-white hover:bg-red-600 dark:hover:bg-red-700 font-bold text-lg px-4 py-3 rounded-lg transition-all duration-200 text-left w-full"
              >
                {tNavbar.contactUs || "Contact"}
              </Link>
              {/* ...Sign In/Sign Up removed from mobile menu... */}
              {/* Language select and dark mode toggle (mobile only, horizontal) */}
              <div className="flex flex-row gap-2 mt-2 md:hidden w-full">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "en" | "th")}
                  className="cursor-pointer  px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 font-semibold focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200"
                  aria-label="Select language"
                >
                  <option value="en">EN</option>
                  <option value="th">TH</option>
                </select>
                <button
                  onClick={toggleTheme}
                  className="cursor-pointer flex items-center gap-2 p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-fit"
                  aria-label="Toggle dark mode"
                >
                  {theme === "dark" ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
                        />
                      </svg>
                      <span className="text-sm">โหมดกลางคืน</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="5"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                        />
                      </svg>
                      <span className="text-sm">โหมดสว่าง</span>
                    </>
                  )}
                </button>
              </div>
            </nav>
          </div>
          <style jsx>{`
            @keyframes slide-down {
              from { transform: translateY(-100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .animate-slide-down {
              animation: slide-down 0.3s cubic-bezier(.4,0,.2,1);
            }
          `}</style>
        </div>
      )}
      {/* Cart Modal */}
      <Cartmodal open={cartModalOpen} onClose={() => setCartModalOpen(false)} />
    </>
  );
};

export default Navbar;
