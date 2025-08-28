"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";

export default function ShippingPage() {
  const { language } = useLanguage();
  const t = translations[language].checkout;
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    address_line1: "",
    address_line2: "",
    sub_district: "",
    district: "",
    province: "",
    postal_code: "",
    country: "",
  });

  // Prefill form from localStorage if exists
  useEffect(() => {
    const refresh_token = document.cookie.match(/urft=([^;]+)/);
    if (!refresh_token) {
      router.replace("/signin");
      return;
    }
    if (typeof window !== "undefined") {
      const shippingStr = localStorage.getItem("checkout_shipping");
      if (shippingStr) {
        try {
          const shippingObj = JSON.parse(shippingStr);
          setForm((prev) => ({ ...prev, ...shippingObj }));
        } catch {}
      }
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleNext(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("checkout_shipping", JSON.stringify(form));
    }
    router.push("/check-out/shipping/payment");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10 text-black dark:text-white">
      <h1 className="text-3xl font-extrabold text-red-700 dark:text-red-300 mb-8 tracking-tight drop-shadow-sm text-center">
        {t.shippingAddress || "Shipping Address"}
      </h1>
      {/* Stepper */}
      <div className="w-full max-w-xl flex flex-col items-center mb-8">
        <ol className="flex w-full justify-between items-center text-sm font-bold">
          <li className="flex-1 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center mb-1">
              1
            </div>
            <span className="text-gray-700 dark:text-gray-200">
              ตรวจสอบสินค้า
            </span>
          </li>
          <li className="flex-1 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center mb-1">
              2
            </div>
            <span className="text-red-700 dark:text-red-300">ที่อยู่</span>
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
            style={{ width: "50%" }}
          />
        </div>
      </div>
      <form
        className="w-full max-w-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-red-100 dark:border-gray-800 flex flex-col gap-6"
        onSubmit={handleNext}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
            placeholder={t.firstName || "First Name"}
            className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
            placeholder={t.lastName || "Last Name"}
            className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <input
          name="phone_number"
          value={form.phone_number}
          onChange={handleChange}
          required
          placeholder={t.phoneNumber || "Phone Number"}
          className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <input
          name="address_line1"
          value={form.address_line1}
          onChange={handleChange}
          required
          placeholder={t.addressLine1 || "Address Line 1"}
          className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <input
          name="address_line2"
          value={form.address_line2}
          onChange={handleChange}
          placeholder={t.addressLine2 || "Address Line 2"}
          className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="sub_district"
            value={form.sub_district}
            onChange={handleChange}
            required
            placeholder={t.subDistrict || "Sub-district"}
            className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <input
            name="district"
            value={form.district}
            onChange={handleChange}
            required
            placeholder={t.district || "District"}
            className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <input
            name="province"
            value={form.province}
            onChange={handleChange}
            required
            placeholder={t.province || "Province"}
            className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="postal_code"
            value={form.postal_code}
            onChange={handleChange}
            required
            placeholder={t.postalCode || "Postal Code"}
            className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            required
            placeholder={t.country || "Country"}
            className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 cursor-pointer bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all duration-200"
        >
          ถัดไป
        </button>
        <button
          type="button"
          className="mt-4 px-6 cursor-pointer py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold shadow hover:scale-105 transition-all duration-200"
          onClick={() => router.push("/check-out")}
        >
          ย้อนกลับ
        </button>
      </form>
    </main>
  );
}
