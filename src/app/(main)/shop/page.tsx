"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";
import ApiService from "@/utils/ApiService";

// Move product generation outside the component to fix hydration error
const productNames = [
  "Hino Truck Brake Pad",
  "HI0390 Engine Part",
  "TTKI Oil Filter",
  "Universal Truck Mirror",
  "Truck Headlight",
  "Heavy Duty Battery",
  "Engine Gasket",
  "Truck Wiper Blade",
  "Cabin Air Filter",
  "Truck Tire",
];
const productImages = ["/hino3.png", "/HI0390.png", "/Logo.png"];
const productDescs = [
  "อะไหล่คุณภาพสูงสำหรับรถบรรทุกทุกประเภท",
  "ทนทาน รับประกันคุณภาพ",
  "ราคาดี ส่งไวทั่วไทย",
  "เหมาะสำหรับงานหนัก",
  "ติดตั้งง่าย ใช้งานสะดวก",
  "สินค้าขายดีประจำเดือน",
  "อะไหล่แท้จากโรงงาน",
  "บริการหลังการขายยอดเยี่ยม",
  "ลดราคาพิเศษ",
  "สินค้าพร้อมส่ง",
];
// ...existing code...

export default function Shop() {
  const { language } = useLanguage();
  const t = translations[language];
  const tShop = t.shop || {};
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [page, setPage] = useState(1);
  const productsPerPage = 20;
  const store = {
    name: tShop.shopTitle || "TTKI Autoparts Company Shop",
    logo: "/Logo.png",
    description:
      tShop.shopDesc ||
      "ศูนย์รวมอะไหล่รถบรรทุกคุณภาพ ส่งตรงจากโรงงาน ราคาดี บริการไว สำหรับลูกค้าทุกท่าน",
  };
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [clientItems, setClientItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // rating: use product.rating when available, otherwise fallback
  const fallbackRating = 0;
  const renderStars = (ratingValue: number | undefined, uid = "") => {
    const r = Math.max(0, Math.min(5, Number(ratingValue ?? fallbackRating)));
    const stars: any[] = [];
    for (let i = 0; i < 5; i++) {
      const pos = i + 1;
      const key = `${uid}-star-${i}`;
      if (r >= pos) {
        stars.push(
          <svg
            key={key}
            className="h-4 w-4 text-yellow-400"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path d="M12 .587l3.668 7.431L23.6 9.75l-5.4 5.264L19.335 24 12 20.012 4.665 24l1.134-8.986L.4 9.75l7.932-1.732L12 .587z" />
          </svg>
        );
      } else if (r >= pos - 0.5) {
        const gid = `half-${uid}-${i}`;
        stars.push(
          <svg
            key={key}
            className="h-4 w-4 text-yellow-400"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <defs>
              <linearGradient id={gid} x1="0" x2="1">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M12 .587l3.668 7.431L23.6 9.75l-5.4 5.264L19.335 24 12 20.012 4.665 24l1.134-8.986L.4 9.75l7.932-1.732L12 .587z"
              fill={`url(#${gid})`}
              stroke="currentColor"
            />
          </svg>
        );
      } else {
        stars.push(
          <svg
            key={key}
            className="h-4 w-4 text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              strokeWidth={1.5}
              d="M12 .587l3.668 7.431L23.6 9.75l-5.4 5.264L19.335 24 12 20.012 4.665 24l1.134-8.986L.4 9.75l7.932-1.732L12 .587z"
            />
          </svg>
        );
      }
    }
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  // User cookie logic
  function getUserFromCookieOrSession() {
    if (typeof window === "undefined") return null;
    // Check sessionStorage first
    const sessionUser = window.sessionStorage.getItem("user");
    if (sessionUser) {
      try {
        return JSON.parse(sessionUser);
      } catch {
        // fallback to cookie
      }
    }
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
    setLoading(true);
    const user = getUserFromCookieOrSession();
    const user_id = user?.user_id;
    // if (user_id) {
    ApiService.getClientItemsPost({ user_id }).then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setClientItems(res.data);
      }
      setLoading(false);
    });
    // } else {
    //   ApiService.getAllClientItems().then((res) => {
    //     if (res.success && Array.isArray(res.data)) {
    //       setClientItems(res.data);
    //     }
    //     setLoading(false);
    //   }
    // );
    // }
  }, []);

  // Merge Standard/Promotion prices for same item_code and client_type
  function mergePromotionProducts(items: any[]) {
    const map = new Map();
    for (const item of items) {
      const key = `${item.item_code}|${item.client_type}`;
      if (!map.has(key)) {
        map.set(key, { ...item, original_price: null, discount_percent: null });
      } else {
        const existing = map.get(key);
        // If one is Promotion and one is Standard, keep Promotion, store Standard price
        if (
          item.price_type === "Promotion" &&
          existing.price_type === "Standard"
        ) {
          map.set(key, {
            ...item,
            original_price: existing.price,
            discount_percent: Math.round(
              100 - (item.price / existing.price) * 100
            ),
          });
        } else if (
          item.price_type === "Standard" &&
          existing.price_type === "Promotion"
        ) {
          map.set(key, {
            ...existing,
            original_price: item.price,
            discount_percent: Math.round(
              100 - (existing.price / item.price) * 100
            ),
          });
        } else {
          // If both are same type, keep the first
        }
      }
    }
    return Array.from(map.values());
  }

  // Filter, merge, sort, and paginate clientItems
  const filteredProducts = mergePromotionProducts(clientItems)
    .filter(
      (product) =>
        product.item_name?.toLowerCase().includes(search.toLowerCase()) ||
        product.item_code?.toLowerCase().includes(search.toLowerCase()) ||
        product.price_type?.toLowerCase().includes(search.toLowerCase()) ||
        product.client_type?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (filter === "price_low") return a.price - b.price;
      if (filter === "price_high") return b.price - a.price;
      return 0;
    });
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  );

  return (
    <main className="min-h-screen w-full flex flex-col bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full flex flex-col items-center py-8 px-2 sm:px-8 ">
        {/* Store section */}
        <div className="flex items-center gap-4 mb-6 w-full max-w-5xl">
          <Image
            src={store.logo}
            alt="Store Logo"
            width={60}
            height={36}
            className="rounded-xl p-1 bg-white dark:bg-gray-900/80"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-red-700 dark:text-red-300">
              {store.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {store.description}
            </p>
          </div>
        </div>
        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-5xl mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={tShop.searchProducts || "Search products..."}
            className="flex-1 px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">{tShop.all || "All"}</option>
            <option value="price_low">
              {tShop.priceLowToHigh || "Price: Low to High"}
            </option>
            <option value="price_high">
              {tShop.priceHighToLow || "Price: High to Low"}
            </option>
            <option value="sold">{tShop.bestSellers || "Best Sellers"}</option>
          </select>
        </div>
        {/* Product list or loading spinner */}
        <div className="min-h-[300px] w-full flex items-center justify-center">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-8xl">
              {[...Array(15)].map((_, idx) => {
                // For 5 columns, calculate row and col
                const col = idx % 5;
                const row = Math.floor(idx / 5);
                // Stagger by row, then col for bounce effect
                const delay = row * 0.18 + col * 0.07;
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center animate-pulse animate-skeleton-bounce"
                    style={{ minHeight: 180, animationDelay: `${delay}s` }}
                  >
                    <div className="mb-2 rounded bg-gray-200 dark:bg-gray-700 w-[100px] h-[60px]" />
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  </div>
                );
              })}
              <style jsx>{`
                @keyframes skeleton-bounce {
                  0% { opacity: 0; transform: translateY(40px) scale(0.96); }
                  40% { opacity: 1; transform: translateY(-10px) scale(1.04); }
                  60% { opacity: 1; transform: translateY(4px) scale(0.98); }
                  100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-skeleton-bounce {
                  animation: skeleton-bounce 0.7s cubic-bezier(.4,0,.2,1);
                }
              `}</style>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-8xl">
              {paginatedProducts.length === 0 ? (
                <div className="col-span-5 text-center text-gray-500 dark:text-gray-400 py-12 text-lg font-bold">
                  {language === "th"
                    ? "สินค้าหมดชั่วคราว"
                    : "No products available"}
                </div>
              ) : (
                paginatedProducts.map((product, idx) => (
                  <Link
                    href={`/shop/${product.item_code}`}
                    key={product.item_code + idx}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition-all relative"
                  >
                    {/* Discount percent at top-right if Promotion */}
                    {product.price_type === "Promotion" &&
                      product.original_price && (
                        <span className="absolute top-3 right-4 text-xs font-bold text-green-600 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow">
                          -{product.discount_percent}%
                        </span>
                      )}
                    <Image
                      src={product.image_urls?.[0] || "/Logo.png"}
                      alt={product.item_name || product.item_code}
                      width={100}
                      height={60}
                      loading="lazy"
                      style={{ aspectRatio: "1 / 1", objectFit: "contain" }}
                      className="mb-2 rounded"
                    />
                    <span className="font-bold text-red-700 dark:text-red-300 text-center">
                      {product.item_name || product.item_code}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 text-sm mb-1 text-center">
                      {product.item_code}
                    </span>
                    {/* Rating stars (use product.rating when available) */}
                    <div className="mb-1">
                      {renderStars(product.rating, String(product.item_code))}
                    </div>
                    <div className="flex flex-row items-center justify-center mb-2 w-full relative">
                      {product.price_type === "Promotion" &&
                      product.original_price ? (
                        <>
                          <span className="text-lg font-bold text-red-600 dark:text-red-400">
                            ฿{product.price?.toLocaleString()}
                          </span>
                          {/* Original price as small tag above promotion price */}
                          <span className=" text-xs text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded shadow line-through">
                            ฿{product.original_price?.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-red-600 dark:text-red-400 mx-auto">
                          ฿{product.price?.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Sold: {product.sold_quantity}
                    </span>
                  </Link>
                ))
              )}
              {/* Item modal removed, navigation is now via Link */}
            </div>
          )}
        </div>
        {/* Pagination controls */}
        {!loading && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {tShop.prev || "Prev"}
            </button>
            <span className="px-2 text-lg font-bold text-red-700 dark:text-red-300">
              {tShop.page || "Page"} {page} / {totalPages}
            </span>
            <button
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              {tShop.next || "Next"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
