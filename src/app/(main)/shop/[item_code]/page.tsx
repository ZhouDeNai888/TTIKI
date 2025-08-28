"use client";
// LocalStorage helpers (same as ItemModal)
function getCartFromLocalStorage() {
  if (typeof window === "undefined") return [];
  try {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
}
function setCartToLocalStorage(cart: Array<any>) {
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  }
}

import React, { useEffect, useState } from "react";
import Image from "next/image";
import ApiService from "@/utils/ApiService";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";

interface ItemDetail {
  item_detail_id: number;
  item_code: string;
  item_name: string;
  description: string;
  po: string;
  color: string;
  model: string;
  oem_no: string;
  pk: string;
  m3: number;
  n_w: number;
  g_w: number;
  created_at: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  image_urls: string[];
  client_type: string;
  stock: number;
  prices: Array<{ price_type: string; price: number }>;
  sold_quantity?: number;
  reviews?: Array<{ user_id: number; rating: number; comment: string }>;
}

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ item_code: string }>;
}) {
  const resolvedParams = React.use(params);
  const { language } = useLanguage();
  const t = translations[language];
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(
    null
  );
  const [recommended, setRecommended] = useState<any[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  // Reviews pagination
  const [reviewPage, setReviewPage] = useState<number>(1);
  const reviewsPerPage = 10;
  // reset page when reviews change
  useEffect(() => {
    setReviewPage(1);
  }, [item?.reviews]);
  // Helper: group recommended items by item_code
  function getUniqueRecommended(items: any[]) {
    // Group by item_code, collect all price types
    const map = new Map();
    for (const item of items) {
      if (!map.has(item.item_code)) {
        map.set(item.item_code, { ...item, prices: [item] });
      } else {
        map.get(item.item_code).prices.push(item);
      }
    }
    return Array.from(map.values());
  }
  const [loadingRecommended, setLoadingRecommended] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let user_id: number | undefined = undefined;
    if (typeof window !== "undefined") {
      // Try get user JSON from cookies
      const cookieMatch = document.cookie.match(/user=([^;]+)/);
      if (cookieMatch) {
        try {
          const userObj = JSON.parse(decodeURIComponent(cookieMatch[1]));
          if (userObj && typeof userObj.user_id === "number") {
            user_id = userObj.user_id;
          }
        } catch {}
      }
      // Try get user JSON from sessionStorage
      if (user_id === undefined) {
        const sessionUser = sessionStorage.getItem("user");
        if (sessionUser) {
          try {
            const userObj = JSON.parse(sessionUser);
            if (userObj && typeof userObj.user_id === "number") {
              user_id = userObj.user_id;
            }
          } catch {}
        }
      }
    }
    ApiService.getItemDetail(resolvedParams.item_code)
      .then((res) => {
        if (res.success && res.data) {
          setItem(res.data);
        } else {
          setError(res.message || "ไม่พบข้อมูลสินค้า");
        }
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [resolvedParams.item_code]);

  // Fetch recommended items (recomment)
  useEffect(() => {
    setLoadingRecommended(true);
    let user_id: number | undefined = undefined;
    if (typeof window !== "undefined") {
      // Try get user JSON from cookies
      const cookieMatch = document.cookie.match(/user=([^;]+)/);
      if (cookieMatch) {
        try {
          const userObj = JSON.parse(decodeURIComponent(cookieMatch[1]));
          if (userObj && typeof userObj.user_id === "number") {
            user_id = userObj.user_id;
          }
        } catch {}
      }
      // Try get user JSON from sessionStorage
      if (user_id === undefined) {
        const sessionUser = sessionStorage.getItem("user");
        if (sessionUser) {
          try {
            const userObj = JSON.parse(sessionUser);
            if (userObj && typeof userObj.user_id === "number") {
              user_id = userObj.user_id;
            }
          } catch {}
        }
      }
    }
    // Fallback: if not found, use undefined (API may handle)
    ApiService.getClientItemsPost({ user_id: user_id ?? 0 })
      .then((res) => {
        if (res.success && res.data) {
          setRecommended(Array.isArray(res.data) ? res.data : []);
        }
      })
      .finally(() => setLoadingRecommended(false));
  }, []);

  if (loading)
    return (
      <main className="bg-white dark:bg-gray-900 min-h-screen py-8 animate-pulse">
        <div className="max-w-6xl mx-auto rounded-xl p-0 flex flex-col md:flex-row gap-0 md:gap-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          {/* Left: Images Skeleton */}
          <div className="flex-shrink-0 flex flex-col items-center w-full md:w-1/2 p-6">
            <div className="flex flex-col items-center w-full">
              <div className="aspect-square w-[220px] h-[220px] md:w-[400px] md:h-[400px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 mb-2 rounded-xl" />
              <div className="flex gap-2 mt-2 overflow-x-hidden py-1 px-1 w-full max-w-[400px] justify-center">
                {[...Array(4)].map((_, idx) => (
                  <div
                    key={idx}
                    className="aspect-square w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gray-200 dark:bg-gray-700"
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Right: Info Skeleton */}
          <div className="flex flex-col justify-between w-full md:w-1/2 p-6">
            <div className="mb-4">
              <div className="h-8 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="flex items-end gap-2 mb-1">
                <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-8 w-14 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="sticky bottom-0 left-0 w-full flex gap-4 py-4 px-6 z-10">
              <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        </div>
        {/* Description & Reviews Skeleton */}
        <div className="max-w-4xl mx-auto mt-8 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
            {[...Array(12)].map((_, idx) => (
              <div
                key={idx}
                className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"
              />
            ))}
          </div>
          <div className="h-5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="space-y-4">
            {[...Array(2)].map((_, idx) => (
              <div
                key={idx}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
        {/* Recommended items Skeleton */}
        <div className="max-w-4xl mx-auto mt-8 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="aspect-square w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        {error}
      </div>
    );
  if (!item) return null;

  const images =
    item.image_urls && item.image_urls.length > 0
      ? item.image_urls
      : ["/Logo.png"];
  const maxStock = item.stock || 1;

  // Price logic
  let price = undefined;
  let original_price = undefined;
  let discount_percent = undefined;
  if (item.prices && item.prices.length > 0) {
    const promo = item.prices.find((p) => p.price_type === "Promotion");
    const standard = item.prices.find((p) => p.price_type === "Standard");
    if (promo) {
      price = promo.price;
      if (standard) {
        original_price = standard.price;
        discount_percent = Math.round(
          100 - (promo.price / standard.price) * 100
        );
      }
    } else if (standard) {
      price = standard.price;
    }
  }

  return (
    <main className="bg-gray-100 dark:bg-gray-900 min-h-screen py-8">
      <div className="max-w-6xl mx-auto rounded-xl p-0 flex flex-col md:flex-row gap-0 md:gap-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
        {/* Left: Images */}
        <div className="flex-shrink-0 flex flex-col items-center w-full md:w-1/2 p-6">
          {/* Shopee-style image gallery */}
          <div className="flex flex-col items-center w-full">
            {/* Main image: always 1:1 aspect ratio */}
            <div className="aspect-square w-[220px] h-[220px] md:w-[400px] md:h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 mb-2">
              <div
                className="aspect-square w-full h-full flex items-center justify-center cursor-pointer"
                onClick={() => setShowImageModal(true)}
              >
                <Image
                  src={images[imgIdx]}
                  alt={item.item_name || item.item_code}
                  width={400}
                  height={400}
                  className="rounded-xl object-contain w-full h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  style={{ aspectRatio: "1 / 1" }}
                />
              </div>
              {/* Modal for image preview */}
              {showImageModal && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-80"
                  onClick={() => setShowImageModal(false)}
                >
                  <div
                    className="relative max-w-4xl w-full flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="absolute top-2 right-2 text-white text-2xl font-bold bg-black bg-opacity-40 rounded-full w-10 h-10 flex items-center justify-center"
                      onClick={() => setShowImageModal(false)}
                    >
                      ×
                    </button>
                    <Image
                      src={images[imgIdx]}
                      alt={item.item_name || item.item_code}
                      width={1200}
                      height={1200}
                      className="object-contain rounded-xl max-h-[92vh] max-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      style={{ aspectRatio: "1 / 1" }}
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Thumbnails: always 1:1 aspect ratio */}
            <div
              className="flex gap-2 mt-2 overflow-x-auto py-1 px-1 w-full max-w-[400px] cursor-grab hide-scrollbar justify-start"
              style={{
                WebkitOverflowScrolling: "touch",
                userSelect: "none",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              onMouseDown={(e) => {
                const el = e.currentTarget;
                let isDragging = false;
                let startX = e.pageX - el.offsetLeft;
                let scrollLeft = el.scrollLeft;
                el.style.cursor = "grabbing";
                function onMouseMove(ev: MouseEvent) {
                  isDragging = true;
                  const x = ev.pageX - el.offsetLeft;
                  el.scrollLeft = scrollLeft - (x - startX);
                }
                function onMouseUp() {
                  el.style.cursor = "grab";
                  window.removeEventListener("mousemove", onMouseMove);
                  window.removeEventListener("mouseup", onMouseUp);
                  setTimeout(() => {
                    isDragging = false;
                  }, 0);
                }
                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
                // Prevent click on thumbnail if dragging
                el.addEventListener("click", function preventClick(ev) {
                  if (isDragging) {
                    ev.preventDefault();
                    ev.stopPropagation();
                  }
                  el.removeEventListener("click", preventClick);
                });
              }}
            >
              {images.map((img, idx) => (
                <button
                  key={img + idx}
                  className={`aspect-square w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 flex items-center justify-center bg-white dark:bg-gray-800 transition-all duration-150 ${
                    imgIdx === idx
                      ? "border-red-600"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                  onClick={() => setImgIdx(idx)}
                  style={{ minWidth: "5rem" }}
                >
                  <div className="w-full h-full cursor-pointer flex items-center justify-center aspect-square">
                    <Image
                      src={img}
                      alt={item.item_name || item.item_code}
                      width={80}
                      height={80}
                      className="object-contain w-full h-full rounded"
                      style={{ aspectRatio: "1 / 1" }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Right: Info */}
        <div className="flex flex-col justify-between w-full md:w-1/2 p-6">
          {/* Item Name & Price */}
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 leading-tight">
              {item.item_name}
            </h1>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400">
                ฿{price}
              </span>
              {original_price &&
                original_price > 0 &&
                original_price !== price && (
                  <span className="text-base line-through text-gray-400 dark:text-gray-500">
                    ฿{original_price}
                  </span>
                )}
              {discount_percent && discount_percent > 0 && (
                <span className="text-xs font-bold text-green-500 dark:text-green-400 ml-2">
                  -{discount_percent}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                className="text-yellow-400 text-lg focus:outline-none cursor-pointer underline"
                onClick={() => {
                  const el = document.getElementById("customer-reviews");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                aria-label="ดูรีวิวจากลูกค้า"
              >
                4.9 ★
              </button>
              <span className="text-gray-500 dark:text-gray-300 text-sm">
                ขายแล้ว {item.sold_quantity ?? 0} ชิ้น
              </span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-300 block">
              คงเหลือ {item.stock}
            </span>
          </div>
          {/* Quantity Selector */}
          <div className="flex items-center gap-2 mb-6 ">
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              จำนวน:
            </span>
            <button
              type="button"
              className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 border text-lg font-bold text-gray-700 dark:text-gray-200 hover:bg-red-100 dark:hover:bg-red-900"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              min={1}
              max={maxStock}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(1, Math.min(maxStock, Number(e.target.value)))
                )
              }
              className="w-14 px-2 py-1 rounded-lg border text-base text-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="button"
              className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 border text-lg font-bold text-gray-700 dark:text-gray-200 hover:bg-red-100 dark:hover:bg-red-900"
              onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
              disabled={quantity >= maxStock}
            >
              +
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              (คงเหลือ {maxStock})
            </span>
          </div>
          {/* Buy Bar */}
          <div className="sticky bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 flex gap-4 py-4 px-6 z-10 rounded-b-xl">
            <button
              className="flex-1 px-6 py-3 cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold text-lg shadow transition-all"
              onClick={() => {
                // Add to cart logic (localStorage)
                const cart = getCartFromLocalStorage();
                const item_name = item.item_name || item.item_code;
                const idx = cart.findIndex(
                  (i: any) => i.item_name === item_name
                );
                if (idx >= 0) {
                  cart[idx].quantity += quantity;
                } else {
                  cart.push({
                    item_name,
                    item_code: item.item_code,
                    quantity,
                    img: images[0],
                  });
                }
                setCartToLocalStorage(cart);
              }}
            >
              เพิ่มลงรถเข็น
            </button>
            <button
              className="flex-1 px-6 py-3 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-lg shadow transition-all"
              onClick={() => {
                let hasUser = false;
                if (typeof window !== "undefined") {
                  hasUser =
                    document.cookie.includes("user=") ||
                    !!sessionStorage.getItem("user");
                }
                if (!hasUser) {
                  window.location.href = "/signin";
                  return;
                }
                const item_name = item.item_name;
                const checkout = [
                  {
                    item_name,
                    price,
                    quantity,
                    img: images[0],
                    item_code: item.item_code,
                  },
                ];
                if (typeof window !== "undefined") {
                  localStorage.setItem("checkout", JSON.stringify(checkout));
                  window.location.href = "/check-out";
                }
              }}
            >
              ซื้อสินค้า
            </button>
          </div>
        </div>
      </div>
      {/* Description & Reviews Shopee style */}
      <div className="max-w-6xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">
          รายละเอียดสินค้า
        </h2>
        <div className="mb-6 text-gray-600 dark:text-gray-300">
          {item.description || "-"}
        </div>
        {/* รายละเอียดสินค้า Shopee style grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">PO:</span> ฟหกasdasd
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Color:</span> ฟหกฟหก
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Model:</span> ฟหกฟหก
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">OEM No:</span> ฟหกฟหก
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">PK:</span> 2
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">M3:</span> 0.2
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">N.W.:</span> 0.5
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">G.W.:</span> 0.5
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Width:</span> 33
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Height:</span> 19
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Length:</span> 150
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Weight:</span> 8
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">
          <span id="customer-reviews">รีวิวจากลูกค้า</span>
        </h3>
        <div className="space-y-4">
          {/* compute source reviews and pagination slice */}
          {(() => {
            const source =
              Array.isArray(item.reviews) && item.reviews.length > 0
                ? item.reviews
                : [
                    {
                      first_name: "คุณสมชาย",
                      rating: 5,
                      comment: "สินค้าคุณภาพดี ส่งไวมาก",
                    },
                    {
                      first_name: "คุณหญิง",
                      rating: 4,
                      comment: "แพ็คสินค้าดีมาก ประทับใจ",
                    },
                    {
                      first_name: "คุณต่อ",
                      rating: 5,
                      comment: "ประทับใจมาก สินค้าตรงปก ส่งเร็ว",
                    },
                    {
                      first_name: "คุณอิ๋ว",
                      rating: 3,
                      comment: "สินค้าพอใช้ได้ แต่รอนานไปหน่อย",
                    },
                    {
                      first_name: "คุณบอย",
                      rating: 4,
                      comment: "คุณภาพดี ราคาคุ้มค่า",
                    },
                    {
                      first_name: "คุณแนน",
                      rating: 5,
                      comment: "ส่งไวมาก บริการดี",
                    },
                    {
                      first_name: "คุณตูน",
                      rating: 4,
                      comment: "สินค้าตรงตามที่สั่ง ซื้อซ้ำแน่นอน",
                    },
                  ];
            const total = source.length;
            const totalPages = Math.max(1, Math.ceil(total / reviewsPerPage));
            const page = Math.min(Math.max(1, reviewPage), totalPages);
            const start = (page - 1) * reviewsPerPage;
            const end = start + reviewsPerPage;
            const pageItems = source.slice(start, end);

            return (
              <>
                {pageItems.map((review: any, idx: number) => (
                  <div
                    key={start + idx}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
                  >
                    <div className="flex items-center mb-2">
                      <span className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill={
                              i < (review.rating ?? review.stars ?? 0)
                                ? "#facc15"
                                : "#d1d5db"
                            }
                            className="w-5 h-5"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z" />
                          </svg>
                        ))}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        โดย{" "}
                        {review.first_name ??
                          review.firstName ??
                          review.name ??
                          "ลูกค้า"}
                      </span>
                    </div>
                    <div className="text-gray-700 dark:text-gray-200">
                      {review.comment ?? review.text ?? ""}
                    </div>
                  </div>
                ))}

                {/* pagination controls */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700"
                    onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Prev
                  </button>
                  <div className="text-sm text-gray-600">
                    หน้า {page} / {totalPages}
                  </div>
                  <button
                    className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700"
                    onClick={() =>
                      setReviewPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page >= totalPages}
                  >
                    Next
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </div>
      {/* Recommended items Shopee style */}
      <div className="max-w-6xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">
          สินค้าแนะนำสำหรับคุณ
        </h2>
        {loadingRecommended ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div
                key={idx}
                className="bg-gray-100 dark:bg-gray-700 rounded-xl shadow animate-pulse"
              >
                <div className="aspect-square w-full rounded-lg bg-gray-200 dark:bg-gray-600" />
                <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-600 rounded w-full" />
                <div className="mt-1 h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={
              getUniqueRecommended(recommended).length > 8
                ? "overflow-x-auto py-2 px-1 hide-scrollbar cursor-grab"
                : "grid grid-cols-2 md:grid-cols-4 gap-6"
            }
            style={
              getUniqueRecommended(recommended).length > 8
                ? {
                    WebkitOverflowScrolling: "touch",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    userSelect: "none",
                    display: "grid",
                    gridTemplateRows: "repeat(2, 1fr)",
                    gridAutoFlow: "column",
                    gridGap: "1.5rem",
                    gridAutoColumns: "minmax(220px,260px)",
                    maxHeight: "700px",
                  }
                : {}
            }
            onMouseDown={
              getUniqueRecommended(recommended).length > 8
                ? (e) => {
                    const el = e.currentTarget;
                    let isDragging = false;
                    let startX = e.pageX - el.offsetLeft;
                    let scrollLeft = el.scrollLeft;
                    el.style.cursor = "grabbing";
                    function onMouseMove(ev: any) {
                      isDragging = true;
                      const event = ev as any;
                      const x = event.pageX - el.offsetLeft;
                      el.scrollLeft = scrollLeft - (x - startX);
                    }
                    function onMouseUp() {
                      el.style.cursor = "grab";
                      window.removeEventListener("mousemove", onMouseMove);
                      window.removeEventListener("mouseup", onMouseUp);
                      setTimeout(() => {
                        isDragging = false;
                      }, 0);
                    }
                    window.addEventListener("mousemove", onMouseMove);
                    window.addEventListener("mouseup", onMouseUp);
                    el.addEventListener("click", function preventClick(ev) {
                      if (isDragging) {
                        ev.preventDefault();
                        ev.stopPropagation();
                      }
                      el.removeEventListener("click", preventClick);
                    });
                  }
                : undefined
            }
          >
            {getUniqueRecommended(recommended).length > 8
              ? getUniqueRecommended(recommended)
                  .slice(0, 16)
                  .map((rec: any, idx: number) => {
                    // Find prices
                    let promo = rec.prices.find(
                      (p: any) => p.price_type === "Promotion"
                    );
                    let standard = rec.prices.find(
                      (p: any) => p.price_type === "Standard"
                    );
                    let price = promo
                      ? promo.price
                      : standard
                      ? standard.price
                      : undefined;
                    let original_price = standard ? standard.price : undefined;
                    let discount_percent =
                      promo && standard
                        ? Math.round(100 - (promo.price / standard.price) * 100)
                        : undefined;
                    return (
                      <a
                        key={rec.item_code}
                        href={`/shop/${rec.item_code}`}
                        className="block bg-white dark:bg-gray-700 rounded-xl shadow hover:shadow-lg border border-gray-100 dark:border-gray-800 p-3 transition-all group"
                        style={{ minWidth: "220px", maxWidth: "260px" }}
                      >
                        <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Image
                            src={
                              rec.image_urls && rec.image_urls.length > 0
                                ? rec.image_urls[0]
                                : "/Logo.png"
                            }
                            alt={rec.item_name || rec.item_code}
                            width={180}
                            height={180}
                            className="object-contain w-full h-full group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="mt-2 text-sm font-bold text-gray-700 dark:text-gray-200 truncate">
                          {rec.item_name}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-red-600 dark:text-red-400 font-bold text-lg">
                            ฿{price ?? "-"}
                          </span>
                          {original_price && original_price !== price && (
                            <span className="text-sm line-through text-gray-400">
                              ฿{original_price}
                            </span>
                          )}
                          {discount_percent && discount_percent > 0 && (
                            <span className="text-xs font-bold text-green-600 ml-1">
                              -{discount_percent}%
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ขายแล้ว {rec.sold || 0} ชิ้น
                        </div>
                      </a>
                    );
                  })
              : getUniqueRecommended(recommended)
                  .slice(0, 8)
                  .map((rec: any, idx: number) => {
                    // Find prices
                    let promo = rec.prices.find(
                      (p: any) => p.price_type === "Promotion"
                    );
                    let standard = rec.prices.find(
                      (p: any) => p.price_type === "Standard"
                    );
                    let price = promo
                      ? promo.price
                      : standard
                      ? standard.price
                      : undefined;
                    let original_price = standard ? standard.price : undefined;
                    let discount_percent =
                      promo && standard
                        ? Math.round(100 - (promo.price / standard.price) * 100)
                        : undefined;
                    return (
                      <a
                        key={rec.item_code}
                        href={`/shop/${rec.item_code}`}
                        className="block min-w-[220px] max-w-[260px] bg-white dark:bg-gray-700 rounded-xl shadow hover:shadow-lg border border-gray-100 dark:border-gray-800 p-3 transition-all group"
                      >
                        <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Image
                            src={
                              rec.image_urls && rec.image_urls.length > 0
                                ? rec.image_urls[0]
                                : "/Logo.png"
                            }
                            alt={rec.item_name || rec.item_code}
                            width={180}
                            height={180}
                            className="object-contain w-full h-full group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="mt-2 text-sm font-bold text-gray-700 dark:text-gray-200 truncate">
                          {rec.item_name}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-red-600 dark:text-red-400 font-bold text-lg">
                            ฿{price ?? "-"}
                          </span>
                          {original_price && original_price !== price && (
                            <span className="text-sm line-through text-gray-400">
                              ฿{original_price}
                            </span>
                          )}
                          {discount_percent && discount_percent > 0 && (
                            <span className="text-xs font-bold text-green-600 ml-1">
                              -{discount_percent}%
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ขายแล้ว {rec.sold || 0} ชิ้น
                        </div>
                      </a>
                    );
                  })}
          </div>
        )}
      </div>
    </main>
  );
}
