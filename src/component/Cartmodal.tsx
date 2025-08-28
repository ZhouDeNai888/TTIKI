// Select All Checkbox component
const SelectAllCheckbox: React.FC<{
  cart: Array<any>;
  selected: Set<number>;
  setSelected: React.Dispatch<React.SetStateAction<Set<number>>>;
}> = ({ cart, selected, setSelected }) => {
  const selectAllRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selected.size > 0 && selected.size < cart.length;
    }
  }, [selected, cart]);
  return (
    <div className="flex items-center mb-4 w-full">
      <input
        ref={selectAllRef}
        type="checkbox"
        className="form-checkbox h-5 w-5 text-red-600 mr-2"
        checked={cart.length > 0 && selected.size === cart.length}
        onChange={(e) => {
          if (e.target.checked) {
            setSelected(new Set(cart)); // cart คือ [0,1,2,...]
          } else {
            setSelected(new Set());
          }
        }}
        id="select-all-cart"
      />
      <label
        htmlFor="select-all-cart"
        className="text-gray-700 dark:text-gray-200 font-semibold cursor-pointer select-none"
      >
        เลือกสินค้าทั้งหมด
      </label>
    </div>
  );
};
import React, { useEffect, useState } from "react";
import ApiService from "@/utils/ApiService";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";

function setCartToLocalStorage(cart: Array<any>) {
  if (typeof window !== "undefined") {
    // Remove price from each item before saving
    const cartNoPrice = cart.map(({ price, ...rest }) => rest);
    localStorage.setItem("cart", JSON.stringify(cartNoPrice));
    window.dispatchEvent(new Event("cartUpdated"));
  }
}

interface CartmodalProps {
  open: boolean;
  onClose: () => void;
}

function getCartFromLocalStorage() {
  if (typeof window === "undefined") return [];
  try {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
}

const Cartmodal: React.FC<CartmodalProps> = ({ open, onClose }) => {
  const [cart, setCart] = useState<Array<any>>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const router = require("next/navigation").useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const tCartmodal = t.cartmodal || {};

  function getUser() {
    if (typeof window === "undefined") return null;
    try {
      const userSession = sessionStorage.getItem("user");
      if (userSession) return JSON.parse(userSession);
      const userCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user="));
      if (userCookie) {
        const value = decodeURIComponent(userCookie.split("=")[1]);
        return JSON.parse(value);
      }
      return null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    let isMounted = true;
    async function fetchCartWithPrices() {
      setLoading(true);
      const localCart = getCartFromLocalStorage();
      if (!open || localCart.length === 0) {
        setCart(localCart);
        setLoading(false);
        return;
      }
      const user = getUser();
      const itemcodeArr = localCart.map((item: any) => item.item_code);
      try {
        const res = await ApiService.getCartItemsPost({
          itemcode: itemcodeArr,
        });
        if (res.success && Array.isArray(res.data)) {
          // Map item_code to price and stock
          const priceStockMap = new Map();
          res.data.forEach((p) => {
            priceStockMap.set(p.item_code, {
              price: p.price,
              stock: p.quantity,
            });
          });
          const updatedCart = localCart.map((item: any) => {
            if (priceStockMap.has(item.item_code)) {
              const { price, stock } = priceStockMap.get(item.item_code);
              return { ...item, price, stock };
            }
            return item;
          });
          if (isMounted) setCart(updatedCart);
        } else {
          if (isMounted) setCart(localCart);
        }
      } catch (err) {
        if (isMounted) setCart(localCart);
      }
      if (isMounted) setLoading(false);
    }
    if (open) {
      fetchCartWithPrices();
    } else {
      setCart([]);
      setLoading(false);
    }
    const handler = () => setCart(getCartFromLocalStorage());
    window.addEventListener("cartUpdated", handler);
    return () => {
      isMounted = false;
      window.removeEventListener("cartUpdated", handler);
    };
  }, [open]);

  if (!open) return null;
  // Calculate total price of selected items
  const total = cart.reduce(
    (sum, item, idx) =>
      selected.has(idx) ? sum + item.price * item.quantity : sum,
    0
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px] transition-all duration-300"
        onClick={onClose}
      />
      <div
        className="relative bg-white/95 dark:bg-gray-900/95 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl sm:shadow-2xl border-2 border-red-200 dark:border-red-900 w-full max-w-[99vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto p-0 z-10 flex flex-col backdrop-blur-xl"
        style={{ boxShadow: "0 4px 16px 0 rgba(31,38,135,0.10)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-2 sm:px-8 md:px-10 pt-4 sm:pt-10 pb-2 sm:pb-3 border-b border-red-100 dark:border-red-900/60 bg-gradient-to-r from-red-50/80 via-white/90 to-red-100/80 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-t-xl sm:rounded-t-2xl md:rounded-t-3xl">
          <h2 className="text-xl sm:text-3xl font-extrabold text-red-700 dark:text-red-200 tracking-wide flex items-center gap-2">
            <span className="drop-shadow-sm text-3xl sm:text-4xl">🛒</span>
            <span className="truncate max-w-[60vw] sm:max-w-none">
              {tCartmodal.orders}
            </span>
          </h2>
          <button
            className="text-gray-500 cursor-pointer dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-full focus:outline-none transition"
            onClick={onClose}
            aria-label={tCartmodal.closeModal}
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
        </div>
        {/* Cart Items */}
        <div className="flex-1 w-full flex flex-col items-center justify-start px-0.5 sm:px-6 md:px-12 py-2 sm:py-6 overflow-y-auto max-h-[70vh] md:max-h-[700px] bg-gradient-to-b from-white/95 to-red-50/60 dark:from-gray-900/95 dark:to-gray-800/90">
          {/* Skeleton loading */}
          {loading ? (
            <ul className="w-full flex flex-col gap-2 sm:gap-4">
              {[...Array(3)].map((_, idx) => (
                <li
                  key={idx}
                  className="flex flex-row items-center gap-2 sm:gap-4 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow border border-red-100 dark:border-red-900/40 p-2 sm:p-4 animate-pulse"
                >
                  <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl" />
                  <div className="flex-1 flex flex-col justify-center w-full min-w-0">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                  <div className="flex items-center gap-2 ml-auto mt-0">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded ml-2" />
                </li>
              ))}
            </ul>
          ) : cart.length > 0 ? (
            <>
              <SelectAllCheckbox
                cart={cart.map((_, idx) => idx)}
                selected={selected}
                setSelected={setSelected}
              />
              <ul className="w-full flex flex-col gap-2 sm:gap-4">
                {cart.map((item: any, idx: number) => (
                  <li
                    key={idx}
                    className="flex flex-row items-center gap-2 sm:gap-4 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow border border-red-100 dark:border-red-900/40 p-2 sm:p-4 transition-all duration-200 hover:shadow-xl hover:border-red-300 dark:hover:border-red-700"
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox h-6 w-6 text-red-600 mr-2 accent-red-500 focus:ring-2 focus:ring-red-400"
                      checked={selected.has(idx)}
                      onChange={(e) => {
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(idx);
                          else next.delete(idx);
                          return next;
                        });
                      }}
                    />
                    <Image
                      src={item.img || "/Logo.png"}
                      alt={item.item_name || "Product"}
                      width={64}
                      height={64}
                      className="rounded-lg sm:rounded-xl border border-red-100 dark:border-red-900 bg-white w-16 h-16 object-cover shadow-sm"
                    />
                    <div className="flex-1 flex flex-col justify-center w-full min-w-0">
                      <span className="font-bold text-red-700 dark:text-red-200 text-sm sm:text-lg mb-0.5 truncate">
                        {item.item_name}
                      </span>
                      <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm truncate">
                        <span className="font-semibold text-red-500 dark:text-red-300">
                          ฿{item.price}
                        </span>
                        <span className="mx-1">×</span> {item.quantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto mt-0">
                      <button
                        className="px-3 py-2 bg-gray-100 cursor-pointer dark:bg-gray-800 rounded-lg text-lg font-bold hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-300 transition min-w-[36px] min-h-[36px]"
                        onClick={() => {
                          const newCart = [...cart];
                          if (newCart[idx].quantity > 1) {
                            newCart[idx].quantity -= 1;
                            setCartToLocalStorage(newCart);
                            setCart(newCart);
                          } else {
                            // If quantity is 1, remove item
                            newCart.splice(idx, 1);
                            setCartToLocalStorage(newCart);
                            setCart(newCart);
                          }
                        }}
                        aria-label={tCartmodal.decreaseQuantity}
                      >
                        -
                      </button>
                      <span className="px-2 text-gray-700 dark:text-gray-200 font-bold text-base">
                        {item.quantity}
                      </span>
                      <button
                        className="px-3 py-2 cursor-pointer bg-gray-100 dark:bg-gray-800 rounded-lg text-lg font-bold hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-300 transition min-w-[36px] min-h-[36px]"
                        onClick={() => {
                          const newCart = [...cart];
                          // Limit quantity to stock from getCartItemsPost (item.stock)
                          const maxStock =
                            item.stock !== undefined ? item.stock : 999;
                          if (newCart[idx].quantity < maxStock) {
                            newCart[idx].quantity += 1;
                            setCartToLocalStorage(newCart);
                            setCart(newCart);
                          }
                        }}
                        aria-label={tCartmodal.increaseQuantity}
                        disabled={
                          item.stock !== undefined
                            ? item.quantity >= item.stock
                            : false
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="ml-0 sm:ml-2 cursor-pointer px-2 py-2 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 flex items-center justify-center shadow-sm transition min-w-[36px] min-h-[36px] mt-2 sm:mt-0"
                      onClick={() => {
                        const newCart = cart.filter((_, i) => i !== idx);
                        setCartToLocalStorage(newCart);
                        setCart(newCart);
                        setSelected((prev) => {
                          const next = new Set(prev);
                          next.delete(idx);
                          return next;
                        });
                      }}
                      aria-label={tCartmodal.viewDetails}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 7h12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0v10a2 2 0 002 2h4a2 2 0 002-2V7"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 11v6m4-6v6"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <span className="text-5xl mb-2">🛒</span>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">
                {tCartmodal.noOrders}
              </p>
            </div>
          )}
        </div>
        {/* Footer: Total and Checkout */}
        <div className="px-1.5 sm:px-6 md:px-12 py-4 sm:py-8 border-t border-red-100 dark:border-red-900/60 bg-gradient-to-t from-white/95 to-red-50/60 dark:from-gray-900/95 dark:to-gray-800/90 rounded-b-xl sm:rounded-b-2xl md:rounded-b-3xl">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <span className="text-sm sm:text-lg font-bold text-gray-700 dark:text-gray-200">
              {tCartmodal.total}
            </span>
            <span className="text-lg sm:text-2xl font-extrabold text-red-700 dark:text-red-300 drop-shadow-sm">
              ฿{total.toLocaleString()}
            </span>
          </div>
          <button
            className="w-full cursor-pointer py-3 sm:py-3 bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:brightness-110 transition-all duration-200 text-base sm:text-lg tracking-wide"
            onClick={() => {
              const user = getUser();
              if (!user) {
                onClose();
                router.push("/signin");
                return;
              }

              // Only checkout selected items
              const checkoutItems = cart.filter((_, idx) => selected.has(idx));

              // Remove price from each item before saving
              const checkoutItemsNoPrice = checkoutItems.map(
                ({ price, ...rest }) => rest
              );
              setCartToLocalStorage(cart); // keep all in cart
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  "checkout",
                  JSON.stringify(checkoutItemsNoPrice)
                );
                onClose();
                router.push("/check-out");
              }
            }}
            disabled={cart.length === 0 || selected.size === 0}
          >
            {tCartmodal.trackOrder}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cartmodal;
