"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { translations } from "@/utils/translation";
import { useLanguage } from "@/context/LanguageContext";
import ApiService from "@/utils/ApiService";

type CartItem = {
  id?: number;
  item_name?: string;
  price?: number;
  quantity?: number;
  img?: string;
};

export default function CheckoutPage() {
  const { language } = useLanguage();
  const t = translations[language].checkout;
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  // ...existing code...
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );
  const tax = +(subtotal * 0.07).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  useEffect(() => {
    const refresh_token = document.cookie.match(/urft=([^;]+)/);
    if (!refresh_token) {
      router.replace("/signin");
      return;
    }
    async function fetchCheckoutCartWithPrices() {
      if (typeof window === "undefined") return;
      const checkoutStr = localStorage.getItem("checkout");
      if (checkoutStr) {
        try {
          const parsed = JSON.parse(checkoutStr);
          if (!parsed || parsed.length === 0) {
            setCart([]);
            router.replace("/shop");
            return;
          }
          const itemcodeArr = parsed.map((item: any) => item.item_code);
          const userStr = sessionStorage.getItem("user");
          let user_id: number | undefined = undefined;
          if (userStr) {
            user_id = JSON.parse(userStr).user_id;
          } else {
            // Try to get user_id from 'user' cookie if not in sessionStorage
            const match = document.cookie.match(/(?:^|; )user=([^;]*)/);
            if (match) {
              try {
                const cookieUser = JSON.parse(decodeURIComponent(match[1]));
                user_id = cookieUser.user_id;
              } catch {}
            }
          }
          // Fetch prices from backend
          const res = await ApiService.getCartItemsPost({
            itemcode: itemcodeArr,
          });
          if (res.success && Array.isArray(res.data)) {
            // Merge backend prices into cart
            const priceMap = new Map<string, number>();
            res.data.forEach((item: any) => {
              priceMap.set(item.item_code, item.price);
            });
            const mergedCart = parsed.map((item: any) => ({
              ...item,
              price: priceMap.get(item.item_code) ?? item.price,
            }));
            setCart(mergedCart);
          } else {
            setCart(parsed);
          }
          setLoading(false);
        } catch (err) {
          setCart([]);
          setLoading(false);
        }
      } else {
        setCart([]);
        setLoading(false);
      }
    }
    fetchCheckoutCartWithPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10 text-black dark:text-white">
      <h1 className="text-3xl font-extrabold text-red-700 dark:text-red-300 mb-8 tracking-tight drop-shadow-sm text-center">
        {t.checkout}
      </h1>
      {/* Stepper */}
      <div className="w-full max-w-2xl flex flex-col items-center mb-8">
        <ol className="flex w-full justify-between items-center text-sm font-bold">
          <li className="flex-1 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center mb-1">
              1
            </div>
            <span className="text-red-700 dark:text-red-300">
              ตรวจสอบสินค้า
            </span>
          </li>
          <li className="flex-1 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center mb-1">
              2
            </div>
            <span className="text-gray-700 dark:text-gray-200">ที่อยู่</span>
          </li>
          <li className="flex-1 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center mb-1">
              3
            </div>
            <span className="text-gray-700 dark:text-gray-200">
              การชำระเงิน
            </span>
          </li>
          <li className="flex-1 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center mb-1">
              4
            </div>
            <span className="text-gray-700 dark:text-gray-200">
              ยืนยันการชำระเงิน
            </span>
          </li>
        </ol>
        <div className="w-full h-1 bg-red-100 dark:bg-gray-800 mt-2 mb-2 relative">
          <div
            className="absolute left-0 top-0 h-1 bg-red-600"
            style={{ width: "25%" }}
          />
        </div>
      </div>
      <div className="w-full max-w-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-red-100 dark:border-gray-800 flex flex-col gap-8">
        {/* Cart Summary Only */}
        <div>
          <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4">
            {t.orderSummary}
          </h2>
          <ul className="divide-y divide-red-100 dark:divide-gray-800">
            {loading ? (
              [...Array(3)].map((_, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center py-3 gap-4 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-red-100 dark:bg-gray-800 rounded-lg" />
                    <div className="h-4 w-24 bg-red-100 dark:bg-gray-800 rounded" />
                  </div>
                  <div className="h-4 w-12 bg-red-100 dark:bg-gray-800 rounded" />
                </li>
              ))
            ) : cart.length > 0 ? (
              cart.map((item, idx) => (
                <li
                  key={item.id || idx}
                  className="flex justify-between items-center py-3 gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.img || "/Logo.png"}
                      alt={item.item_name || "Product"}
                      className="h-12 w-12 object-contain rounded-lg border border-red-100 dark:border-gray-700 bg-white dark:bg-gray-900"
                    />
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      {item.item_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      x{item.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-red-700 dark:text-red-300">
                    ฿{item.price?.toLocaleString()}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-center text-gray-500 dark:text-gray-400 py-6">
                {t.yourCartIsEmpty}
              </li>
            )}
          </ul>
          <div className="flex flex-col gap-2 mt-4 text-lg font-bold">
            <div className="flex justify-between items-center">
              <span>ยอดรวม (Subtotal)</span>
              <span className="text-black dark:text-white">
                ฿{subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>ภาษี 7% (VAT)</span>
              <span className="text-black dark:text-white">
                ฿{tax.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>รวมทั้งหมด (Total)</span>
              <span className="text-black dark:text-white font-extrabold text-xl">
                ฿{total.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mt-8 gap-4">
              <button
                className="px-6 py-3 cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold shadow hover:scale-105 transition-all duration-200"
                onClick={() => router.push("/shop")}
              >
                ย้อนกลับ
              </button>
              <button
                className="px-6 py-3 cursor-pointer bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all duration-200"
                onClick={() => router.push("/check-out/shipping")}
                disabled={cart.length === 0}
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
