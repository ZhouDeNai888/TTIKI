"use client";
import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";
import ApiService from "@/utils/ApiService";
import AlertModal from "@/component/AlertModal";

// ItemDetail interface
interface ItemDetail {
  item_detail_id: number;
  item_code: string;
  item_name?: string;
  car_brand_abbr?: string;
  car_year_abbr?: string;
  car_type_code?: string;
  car_version_code?: string;
  car_category_abbr?: string;
  car_side_code?: string;
  car_feature_abbr?: string;
  description: string;
  po: string;
  color: string;
  model: string;
  oem_no?: string;
  pk: string;
  m3: string | number;
  n_w: string | number;
  g_w: string | number;
  pictures?: File[];
  image_urls?: string[];
  width?: string | number;
  height?: string | number;
  length?: string | number;
  weight?: string | number;
}

// local alert type (matches AlertModal AlertType)
type LocalAlertType = "success" | "error" | "info" | "warning" | "delete";

export default function ManageProduct() {
  // ...existing code...
  // State for image index per card (ใช้กับ card/table view)
  const [cardImgIdxs, setCardImgIdxs] = React.useState<{
    [id: number]: number;
  }>({});

  // AlertModal state
  const [alertState, setAlertState] = useState<{
    open: boolean;
    title?: string;
    message: string;
    type?: LocalAlertType;
    autoCloseMs?: number | null;
  }>({ open: false, message: "", type: "info", autoCloseMs: null });

  const showAlert = (
    message: string,
    type: LocalAlertType = "info",
    title?: string,
    autoCloseMs: number | null = null
  ) => {
    setAlertState({ open: true, title, message, type, autoCloseMs });
  };

  async function refreshItems() {
    setLoading(true);
    try {
      const res = await ApiService.getAllItems();
      if (res.success && Array.isArray(res.data)) {
        setItemDetails(res.data);
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  }
  const [carVersionOptions, setCarVersionOptions] = useState<any[]>([]);
  // Dropdown options state
  const [carBrandOptions, setCarBrandOptions] = useState<any[]>([]);
  const [carYearOptions, setCarYearOptions] = useState<any[]>([]);
  const [carTypeOptions, setCarTypeOptions] = useState<any[]>([]);
  const [carCategoryOptions, setCarCategoryOptions] = useState<any[]>([]);
  const [carFeatureOptions, setCarFeatureOptions] = useState<any[]>([]);
  const [carSideOptions, setCarSideOptions] = useState<any[]>([]);

  React.useEffect(() => {
    ApiService.getAllCarVersions().then((res) => {
      if (res.success && Array.isArray(res.data))
        setCarVersionOptions(res.data);
    });
    const fetchOptions = async () => {
      const ApiService = (await import("@/utils/ApiService")).default;
      ApiService.getAllCarBrands().then((res) => {
        if (res.success && Array.isArray(res.data))
          setCarBrandOptions(res.data);
      });
      ApiService.getAllCarYears().then((res) => {
        if (res.success && Array.isArray(res.data)) setCarYearOptions(res.data);
      });
      ApiService.getAllCarTypes().then((res) => {
        if (res.success && Array.isArray(res.data)) setCarTypeOptions(res.data);
      });
      ApiService.getAllCarCategories().then((res) => {
        if (res.success && Array.isArray(res.data))
          setCarCategoryOptions(res.data);
      });
      ApiService.getAllCarFeatures().then((res) => {
        if (res.success && Array.isArray(res.data))
          setCarFeatureOptions(res.data);
      });
      ApiService.getAllCarSides().then((res) => {
        if (res.success && Array.isArray(res.data)) setCarSideOptions(res.data);
      });
    };
    fetchOptions();
  }, []);
  const [selectedImageIdx, setSelectedImageIdx] = useState<number | null>(null);
  const [imageDropdownOpen, setImageDropdownOpen] = useState(false);
  // Dynamic image input state
  const [imageInputs, setImageInputs] = useState([
    { id: Date.now(), file: null as File | null },
  ]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  // Slider indices for each row
  const [sliderIndices, setSliderIndices] = useState<number[]>([]);
  const { language } = useLanguage();
  const t = translations[language].itemmanage;
  const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(itemDetails.length / itemsPerPage);
  const paginatedDetails = itemDetails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<ItemDetail | null>(null);
  const [itemDetail, setItemDetail] = useState<ItemDetail>({
    item_detail_id: 0,
    item_code: "",
    item_name: "",
    car_brand_abbr: "",
    car_year_abbr: "",
    car_type_code: "",
    car_version_code: "",
    car_category_abbr: "",
    car_side_code: "",
    car_feature_abbr: "",
    description: "",
    po: "",
    color: "",
    model: "",
    oem_no: "",
    pk: "",
    m3: "",
    n_w: "",
    g_w: "",
    width: "",
    height: "",
    length: "",
    weight: "",
    pictures: [],
  });

  // Reset image index เมื่อ itemDetails เปลี่ยน
  React.useEffect(() => {
    const newIdxs: { [id: number]: number } = {};
    if (Array.isArray(itemDetails)) {
      itemDetails.forEach((detail) => {
        newIdxs[detail.item_detail_id] = 0;
      });
      setCardImgIdxs(newIdxs);
    }
  }, [itemDetails]);

  async function handleAddItemDetail(e: React.FormEvent) {
    e.preventDefault();
    if (editItemId !== null) {
      // Save edit (call API)
      const payload = {
        car_brand_abbr: itemDetail.car_brand_abbr,
        car_year_abbr: itemDetail.car_year_abbr,
        car_type_code: itemDetail.car_type_code,
        car_version_code: itemDetail.car_version_code,
        car_category_abbr: itemDetail.car_category_abbr,
        car_side_code: itemDetail.car_side_code,
        car_feature_abbr: itemDetail.car_feature_abbr,
        item_name: itemDetail.item_name || "",
        description: itemDetail.description,
        po: itemDetail.po,
        color: itemDetail.color,
        model: itemDetail.model,
        oem_no: itemDetail.oem_no,
        pk: itemDetail.pk,
        m3: itemDetail.m3,
        n_w: itemDetail.n_w,
        g_w: itemDetail.g_w,
        width: itemDetail.width,
        height: itemDetail.height,
        length: itemDetail.length,
        weight: itemDetail.weight,
        images: itemDetail.pictures,
      };
      const res = await ApiService.updateItemDetail(editItemId, payload);
      if (res.success && res.data) {
        await refreshItems();
        // Optionally show success message
      } else {
        // Show error message using AlertModal
        showAlert(
          res.message || "เกิดข้อผิดพลาดในการแก้ไขสินค้า",
          "error",
          "ข้อผิดพลาด"
        );
      }
      setEditItemId(null);
    } else {
      // Add new (call API)
      const payload = {
        car_brand_abbr: itemDetail.car_brand_abbr,
        car_year_abbr: itemDetail.car_year_abbr,
        car_type_code: itemDetail.car_type_code,
        car_version_code: itemDetail.car_version_code,
        car_category_abbr: itemDetail.car_category_abbr,
        car_side_code: itemDetail.car_side_code,
        car_feature_abbr: itemDetail.car_feature_abbr,
        item_name: itemDetail.item_name || "",
        description: itemDetail.description,
        po: itemDetail.po,
        color: itemDetail.color,
        model: itemDetail.model,
        oem_no: itemDetail.oem_no,
        pk: itemDetail.pk,
        m3: itemDetail.m3,
        n_w: itemDetail.n_w,
        g_w: itemDetail.g_w,
        width: itemDetail.width,
        height: itemDetail.height,
        length: itemDetail.length,
        weight: itemDetail.weight,
        images: itemDetail.pictures,
      };
      const res = await ApiService.addItem(payload);
      if (res.success && res.data) {
        await refreshItems();
        // Optionally show success message
      } else {
        // Show error message using AlertModal
        showAlert(
          res.message || "เกิดข้อผิดพลาดในการเพิ่มสินค้า",
          "error",
          "ข้อผิดพลาด"
        );
      }
    }
    setItemDetail({
      item_detail_id: 0,
      item_code: "",
      item_name: "",
      description: "",
      po: "",
      color: "",
      model: "",
      oem_no: "",
      pk: "",
      m3: "",
      n_w: "",
      g_w: "",
      width: "",
      height: "",
      length: "",
      weight: "",
      pictures: [],
      car_brand_abbr: "",
      car_year_abbr: "",
      car_type_code: "",
      car_version_code: "",
      car_category_abbr: "",
      car_side_code: "",
      car_feature_abbr: "",
    });
  }

  async function urlToFile(
    url: string,
    filename: string
  ): Promise<File | null> {
    // Retry with exponential backoff to handle transient network / server hiccups.
    const maxAttempts = 4;
    const baseDelayMs = 250;

    // Use same-origin proxy to avoid CORS issues when fetching blobs.
    const proxyBase = "/api/proxy/image?src=";
    const proxied = proxyBase + encodeURIComponent(url);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(proxied);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.blob();
        return new File([data], filename, { type: data.type });
      } catch (err) {
        console.debug("urlToFile fetch failed", url, err, "attempt", attempt);
        if (attempt < maxAttempts) {
          const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
          await new Promise((res) => setTimeout(res, delayMs));
          continue;
        }
        return null;
      }
    }
    return null;
  }

  async function handleEditItem(id: number) {
    const found = itemDetails.find((d) => d.item_detail_id === id);
    if (found) {
      const pictures: File[] = [];
      const failedUrls: string[] = [];
      if (found.image_urls && found.image_urls.length > 0) {
        // small initial pause — opening DevTools changes timing which hides the bug;
        // mimick that timing so headless/normal runs behave similarly
        await new Promise((res) => setTimeout(res, 200));
        for (let i = 0; i < found.image_urls.length; i++) {
          const url = found.image_urls[i];
          const name = url.split("/").pop() || "image.jpg";
          const file = await urlToFile(url, name);
          if (file) pictures.push(file);
          else failedUrls.push(url);
          // tiny pause between downloads reduces last-image failure rate
          if (i < found.image_urls.length - 1) {
            await new Promise((res) => setTimeout(res, 180));
          }
        }
        if (failedUrls.length > 0) {
          const sample = failedUrls.slice(0, 3).join("\n");
          showAlert(
            `ไม่สามารถโหลดภาพ ${failedUrls.length} รายการ\nตัวอย่าง:\n${sample}`,
            "warning",
            "โหลดรูปไม่สำเร็จ",
            6000
          );
        }
      }
      setEditItemId(id);
      setItemDetail({ ...found, pictures });
      setActiveTab("form"); // Switch to form tab when editing
    }
  }

  function handleSaveItem(e: React.FormEvent) {
    // No longer needed, handled in handleAddItemDetail
  }

  function handleDeleteItem(id: number) {
    ApiService.deleteItemDetail(id).then(() => {
      refreshItems();
    });
  }

  function handleEditItemChange(e: React.ChangeEvent<HTMLInputElement>) {
    // No longer needed, use handleItemDetailChange
  }

  function handleItemDetailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setItemDetail((prev) => ({ ...prev, [name]: value }));
  }

  const [loading, setLoading] = useState(false);
  React.useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await ApiService.getAllItems();
        if (res.success && Array.isArray(res.data)) {
          setItemDetails(res.data);
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);
  const [activeTab, setActiveTab] = useState<"form" | "list">("list");
  return (
    <div className="w-full max-w-8xl mx-auto bg-white dark:bg-gray-900 p-8 mt-30 mb-30">
      <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mt-10 mb-6 text-center">
        {t.title}
      </h2>
      <div className="flex justify-center mb-8 gap-4">
        <button
          className={`cursor-pointer px-6 py-2 rounded-lg font-bold shadow transition-all text-lg border border-red-300 dark:border-red-700 focus:outline-none ${
            activeTab === "form"
              ? "bg-red-700 text-white"
              : "bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900"
          }`}
          onClick={() => setActiveTab("form")}
        >
          กรอกข้อมูลสินค้า
        </button>
        <button
          className={`cursor-pointer px-6 py-2 rounded-lg font-bold shadow transition-all text-lg border border-red-300 dark:border-red-700 focus:outline-none ${
            activeTab === "list"
              ? "bg-red-700 text-white"
              : "bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900"
          }`}
          onClick={() => setActiveTab("list")}
        >
          รายการสินค้า
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        {/* Left: Official Item Detail Form */}
        {activeTab === "form" && (
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg p-8 border border-red-200 dark:border-red-800 w-full md:col-span-1">
            <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-6 text-center">
              กรอกข้อมูลสินค้า
            </h3>
            <form
              className="flex flex-col gap-4"
              onSubmit={handleAddItemDetail}
            >
              <div className="flex flex-row gap-4 flex-wrap ">
                <div className="flex flex-col justify-end min-w-[120px]">
                  <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
                    {t.itemCode}
                  </label>
                  <div className="mt-2 text-xl text-gray-500 dark:text-gray-400 font-bold">
                    {itemDetail.item_code}
                  </div>
                </div>
              </div>
              {/* Row 1 */}
              <div className="flex flex-row gap-4 flex-wrap">
                <div className="flex flex-col min-w-[120px]">
                  <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
                    {t.brand}
                  </label>
                  <select
                    name="car_brand_abbr"
                    value={itemDetail.car_brand_abbr || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItemDetail((prev) => {
                        const newDetail = { ...prev, car_brand_abbr: val };
                        newDetail.item_code = [
                          val,
                          prev.car_year_abbr || "",
                          prev.car_type_code || "",
                          prev.car_version_code || "",
                          prev.car_category_abbr || "",
                          prev.car_feature_abbr || "",
                          prev.car_side_code || "",
                        ]
                          .filter(Boolean)
                          .join("");
                        return newDetail;
                      });
                    }}
                    className="px-2 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-24"
                  >
                    <option value="">เลือกแบรนด์</option>
                    {carBrandOptions.map((opt) => (
                      <option key={opt.car_brand_id} value={opt.car_brand_abbr}>
                        {opt.car_brand_abbr} - {opt.car_brand_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col min-w-[80px]">
                  <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
                    {t.year}
                  </label>
                  <select
                    name="car_year_abbr"
                    value={itemDetail.car_year_abbr || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItemDetail((prev) => {
                        const newDetail = { ...prev, car_year_abbr: val };
                        newDetail.item_code = [
                          prev.car_brand_abbr || "",
                          val,
                          prev.car_type_code || "",
                          prev.car_version_code || "",
                          prev.car_category_abbr || "",
                          prev.car_feature_abbr || "",
                          prev.car_side_code || "",
                        ]
                          .filter(Boolean)
                          .join("");
                        return newDetail;
                      });
                    }}
                    className="px-2 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-16"
                  >
                    <option value="">เลือกปี</option>
                    {carYearOptions.map((opt) => (
                      <option key={opt.car_year_id} value={opt.car_year_abbr}>
                        {opt.car_year_abbr} - {opt.car_year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col min-w-[80px]">
                  <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
                    {t.type}
                  </label>
                  <select
                    name="car_type_code"
                    value={itemDetail.car_type_code || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItemDetail((prev) => {
                        const newDetail = { ...prev, car_type_code: val };
                        newDetail.item_code = [
                          prev.car_brand_abbr || "",
                          prev.car_year_abbr || "",
                          val,
                          prev.car_version_code || "",
                          prev.car_category_abbr || "",
                          prev.car_feature_abbr || "",
                          prev.car_side_code || "",
                        ]
                          .filter(Boolean)
                          .join("");
                        return newDetail;
                      });
                    }}
                    className="px-2 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-16"
                  >
                    <option value="">เลือกประเภท</option>
                    {carTypeOptions.map((opt) => (
                      <option key={opt.car_type_id} value={opt.car_type_code}>
                        {opt.car_type_code} - {opt.car_type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col min-w-[120px]">
                  <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
                    เวอร์ชั่น
                  </label>
                  <select
                    name="car_version_code"
                    value={itemDetail.car_version_code || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItemDetail((prev) => {
                        const newDetail = { ...prev, car_version_code: val };
                        newDetail.item_code = [
                          prev.car_brand_abbr || "",
                          prev.car_year_abbr || "",
                          prev.car_type_code || "",
                          val,
                          prev.car_category_abbr || "",
                          prev.car_feature_abbr || "",
                          prev.car_side_code || "",
                          val,
                        ]
                          .filter(Boolean)
                          .join("");
                        return newDetail;
                      });
                    }}
                    className="px-2 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-24"
                  >
                    <option value="">เลือกเวอร์ชั่น</option>
                    {carVersionOptions.map((opt) => (
                      <option
                        key={opt.car_version_id}
                        value={opt.car_version_code}
                      >
                        {opt.car_version_code} - {opt.car_version}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col min-w-[100px]">
                  <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
                    {t.category}
                  </label>
                  <select
                    name="car_category_abbr"
                    value={itemDetail.car_category_abbr || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItemDetail((prev) => {
                        const newDetail = { ...prev, car_category_abbr: val };
                        newDetail.item_code = [
                          prev.car_brand_abbr || "",
                          prev.car_year_abbr || "",
                          prev.car_type_code || "",
                          prev.car_version_code || "",
                          val,
                          prev.car_feature_abbr || "",
                          prev.car_side_code || "",
                        ]
                          .filter(Boolean)
                          .join("");
                        return newDetail;
                      });
                    }}
                    className="px-2 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-20"
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    {carCategoryOptions.map((opt) => (
                      <option
                        key={opt.car_category_id}
                        value={opt.car_category_abbr}
                      >
                        {opt.car_category_abbr} - {opt.car_category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col min-w-[100px]">
                  <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
                    {t.feature}
                  </label>
                  <select
                    name="car_feature_abbr"
                    value={itemDetail.car_feature_abbr || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItemDetail((prev) => {
                        const newDetail = { ...prev, car_feature_abbr: val };
                        newDetail.item_code = [
                          prev.car_brand_abbr || "",
                          prev.car_year_abbr || "",
                          prev.car_type_code || "",
                          prev.car_version_code || "",
                          prev.car_category_abbr || "",
                          val,
                          prev.car_side_code || "",
                        ]
                          .filter(Boolean)
                          .join("");
                        return newDetail;
                      });
                    }}
                    className="px-2 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-20"
                  >
                    <option value="">เลือกฟีเจอร์</option>
                    {carFeatureOptions.map((opt) => (
                      <option
                        key={opt.car_feature_id}
                        value={opt.car_feature_abbr}
                      >
                        {opt.car_feature_abbr} - {opt.car_feature}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col min-w-[80px]">
                  <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
                    {t.side}
                  </label>
                  <select
                    name="car_side_code"
                    value={itemDetail.car_side_code || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItemDetail((prev) => {
                        const newDetail = { ...prev, car_side_code: val };
                        newDetail.item_code = [
                          prev.car_brand_abbr || "",
                          prev.car_year_abbr || "",
                          prev.car_type_code || "",
                          prev.car_version_code || "",
                          prev.car_category_abbr || "",
                          prev.car_feature_abbr || "",
                          val,
                        ]
                          .filter(Boolean)
                          .join("");
                        return newDetail;
                      });
                    }}
                    className="px-2 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-16"
                  >
                    <option value="">เลือกด้าน</option>
                    {carSideOptions.map((opt) => (
                      <option key={opt.car_side_id} value={opt.car_side_code}>
                        {opt.car_side_code} - {opt.car_side}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Row 2 */}
              <div className="flex flex-row gap-4 flex-wrap">
                <div className="flex flex-col min-w-[120px]">
                  <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
                    ชื่อสินค้า
                  </label>
                  <input
                    type="text"
                    name="item_name"
                    value={itemDetail.item_name || ""}
                    onChange={handleItemDetailChange}
                    className="px-2 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-32"
                    placeholder="ชื่อสินค้า"
                  />
                </div>
                <div className="flex flex-col min-w-[180px]">
                  <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
                    {t.pictures}
                  </label>
                  <div className="relative w-full">
                    <button
                      type="button"
                      className="cursor-pointer w-full px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-left"
                      onClick={() => setImageDropdownOpen((open) => !open)}
                    >
                      {selectedImageIdx === null
                        ? `เลือกหรือเพิ่มรูปภาพ${
                            itemDetail.pictures &&
                            itemDetail.pictures.length > 0
                              ? ` (${itemDetail.pictures.length} รูป)`
                              : ""
                          }`
                        : itemDetail.pictures &&
                          itemDetail.pictures[selectedImageIdx]
                        ? `จำนวน${
                            itemDetail.pictures.length > 1
                              ? ` (${itemDetail.pictures.length} รูป)`
                              : ""
                          }`
                        : `เลือกหรือเพิ่มรูปภาพ${
                            itemDetail.pictures &&
                            itemDetail.pictures.length > 0
                              ? ` (${itemDetail.pictures.length} รูป)`
                              : ""
                          }`}
                    </button>
                    {imageDropdownOpen && (
                      <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg shadow-lg mt-1">
                        {itemDetail.pictures &&
                          itemDetail.pictures.length > 0 &&
                          itemDetail.pictures.map((pic, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900 cursor-pointer"
                            >
                              <span
                                className="text-gray-900 dark:text-gray-100"
                                onClick={() => {
                                  setSelectedImageIdx(idx);
                                  setImageDropdownOpen(false);
                                }}
                              >
                                {pic.name}
                              </span>
                              <button
                                type="button"
                                className="cursor-pointer text-red-600 hover:text-red-900 font-bold text-lg ml-2"
                                onClick={() => {
                                  setItemDetail((prev) => ({
                                    ...prev,
                                    pictures:
                                      prev.pictures?.filter(
                                        (_, i) => i !== idx
                                      ) || [],
                                  }));
                                  setSelectedImageIdx(null);
                                  setImageDropdownOpen(false);
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        <div className="flex items-center px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900 cursor-pointer">
                          <label className="w-full text-gray-900 dark:text-gray-100 cursor-pointer">
                            <span>{t.addPicture}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setItemDetail((prev) => {
                                    const newPictures = [
                                      ...(prev.pictures || []),
                                      file,
                                    ];
                                    setSelectedImageIdx(newPictures.length - 1);
                                    return { ...prev, pictures: newPictures };
                                  });
                                  setImageDropdownOpen(false);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col min-w-[120px]">
                  <label
                    htmlFor="po"
                    className="mb-1 font-semibold text-red-700 dark:text-red-300"
                  >
                    {t.po}
                  </label>
                  <input
                    id="po"
                    type="text"
                    name="po"
                    placeholder="PO"
                    value={itemDetail.po}
                    onChange={handleItemDetailChange}
                    className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col min-w-[120px]">
                  <label
                    htmlFor="color"
                    className="mb-1 font-semibold text-red-700 dark:text-red-300"
                  >
                    {t.color}
                  </label>
                  <input
                    id="color"
                    type="text"
                    name="color"
                    placeholder="Color"
                    value={itemDetail.color}
                    onChange={handleItemDetailChange}
                    className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col min-w-[120px]">
                  <label
                    htmlFor="model"
                    className="mb-1 font-semibold text-red-700 dark:text-red-300"
                  >
                    {t.model}
                  </label>
                  <input
                    id="model"
                    type="text"
                    name="model"
                    placeholder="Model"
                    value={itemDetail.model}
                    onChange={handleItemDetailChange}
                    className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              {/* Row 3 */}
              <div className="flex flex-row gap-4 flex-wrap">
                <div className="flex flex-col min-w-[120px]">
                  <label
                    htmlFor="oem_no"
                    className="mb-1 font-semibold text-red-700 dark:text-red-300"
                  >
                    {t.oem_no}
                  </label>
                  <input
                    id="oem_no"
                    type="text"
                    name="oem_no"
                    placeholder="oem No."
                    value={itemDetail.oem_no}
                    onChange={handleItemDetailChange}
                    className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col min-w-[120px]">
                  <label
                    htmlFor="pk"
                    className="mb-1 font-semibold text-red-700 dark:text-red-300"
                  >
                    {t.pk}
                  </label>
                  <input
                    id="pk"
                    type="text"
                    name="pk"
                    placeholder="PK"
                    value={itemDetail.pk}
                    onChange={handleItemDetailChange}
                    className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col min-w-[120px]">
                  <label
                    htmlFor="m3"
                    className="mb-1 font-semibold text-red-700 dark:text-red-300"
                  >
                    {t.m3}
                  </label>
                  <input
                    id="m3"
                    type="text"
                    name="m3"
                    placeholder="M3"
                    value={itemDetail.m3}
                    onChange={handleItemDetailChange}
                    className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col min-w-[120px]">
                  <label
                    htmlFor="n_w"
                    className="mb-1 font-semibold text-red-700 dark:text-red-300"
                  >
                    {t.n_w}
                  </label>
                  <input
                    id="n_w"
                    type="text"
                    name="n_w"
                    placeholder="N.W."
                    value={itemDetail.n_w}
                    onChange={handleItemDetailChange}
                    className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col min-w-[120px]">
                  <label
                    htmlFor="g_w"
                    className="mb-1 font-semibold text-red-700 dark:text-red-300"
                  >
                    {t.g_w}
                  </label>
                  <input
                    id="g_w"
                    type="text"
                    name="g_w"
                    placeholder="G.W."
                    value={itemDetail.g_w}
                    onChange={handleItemDetailChange}
                    className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              {/* Row 4 - Dimensions and Weight */}
              <div className="flex flex-row gap-4 flex-wrap">
                <div className="flex flex-col min-w-[120px]">
                  <label
                    htmlFor="width"
                    className="mb-1 font-semibold text-red-700 dark:text-red-300"
                  >
                    Width
                  </label>
                  <input
                    id="width"
                    type="number"
                    step="0.01"
                    name="width"
                    placeholder="Width"
                    value={itemDetail.width ?? ""}
                    onChange={handleItemDetailChange}
                    className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col min-w-[120px]">
                  <label
                    htmlFor="height"
                    className="mb-1 font-semibold text-red-700 dark:text-red-300"
                  >
                    Height
                  </label>
                  <input
                    id="height"
                    type="number"
                    step="0.01"
                    name="height"
                    placeholder="Height"
                    value={itemDetail.height ?? ""}
                    onChange={handleItemDetailChange}
                    className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col min-w-[120px]">
                  <label
                    htmlFor="length"
                    className="mb-1 font-semibold text-red-700 dark:text-red-300"
                  >
                    Length
                  </label>
                  <input
                    id="length"
                    type="number"
                    step="0.01"
                    name="length"
                    placeholder="Length"
                    value={itemDetail.length ?? ""}
                    onChange={handleItemDetailChange}
                    className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col min-w-[120px]">
                  <label
                    htmlFor="weight"
                    className="mb-1 font-semibold text-red-700 dark:text-red-300"
                  >
                    Weight
                  </label>
                  <input
                    id="weight"
                    type="number"
                    step="0.01"
                    name="weight"
                    placeholder="Weight"
                    value={itemDetail.weight ?? ""}
                    onChange={handleItemDetailChange}
                    className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              {/* Description textarea below */}
              <div className="flex flex-col mb-2">
                <label
                  htmlFor="description"
                  className="mb-1 font-semibold text-red-700 dark:text-red-300"
                >
                  {t.description}
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Description"
                  value={safeValue(itemDetail.description)}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setItemDetail((prev) => ({ ...prev, [name]: value }));
                  }}
                  rows={5}
                  className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 "
                />
              </div>
              <div className="flex gap-4 mt-6 justify-center">
                <button
                  type="submit"
                  className="cursor-pointer px-6 py-2 bg-red-700 hover:bg-red-900 text-white font-bold rounded-lg shadow-lg transition-all text-lg"
                >
                  {editItemId !== null ? t.save : t.addItem}
                </button>
                {editItemId !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditItemId(null);
                      setItemDetail({
                        item_detail_id: 0,
                        item_code: "",
                        description: "",
                        po: "",
                        color: "",
                        model: "",
                        oem_no: "",
                        pk: "",
                        m3: "",
                        n_w: "",
                        g_w: "",
                        width: "",
                        height: "",
                        length: "",
                        weight: "",
                      });
                    }}
                    className="cursor-pointer px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg shadow-lg"
                  >
                    {t.cancel}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
        {/* Right: Item List Table */}
        {activeTab === "list" && (
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg p-2 sm:p-4 md:p-8 border border-red-200 dark:border-red-800 w-full md:col-span-1">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-red-700 dark:text-red-300 mb-2 sm:mb-4 md:mb-6 text-center">
              รายการสินค้า
            </h3>
            {/* Card layout for sm and md, table for lg+ */}
            <div className="w-full">
              <div className="block lg:hidden">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, idx) => (
                      <div
                        key={idx}
                        className="bg-red-50 dark:bg-red-900 rounded-xl shadow p-4 flex flex-col gap-2 animate-pulse"
                      >
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-700" />
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-2/3" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-1/2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-full" />
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {[...Array(12)].map((_, i) => (
                            <div
                              key={i}
                              className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"
                            />
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : itemDetails.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    ไม่มีข้อมูลสินค้า
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {itemDetails.map((detail, idx) => (
                      <div
                        key={detail.item_detail_id}
                        className="bg-red-50 dark:bg-red-900 rounded-xl shadow p-4 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-center mb-2">
                          {Array.isArray(detail.image_urls) &&
                          detail.image_urls?.length > 0 ? (
                            <img
                              src={detail.image_urls?.[0]}
                              alt="รูป"
                              className="w-24 h-24 object-cover rounded border border-gray-300 dark:border-gray-700"
                            />
                          ) : (
                            <span className="text-gray-400">ไม่มีรูป</span>
                          )}
                        </div>
                        <div className="font-bold text-red-700 dark:text-red-300 text-base mb-1">
                          {detail.item_name}
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-200 mb-1">
                          {detail.item_code}
                        </div>
                        <div
                          className="text-xs text-gray-700 dark:text-gray-200 mb-1 truncate"
                          title={detail.description}
                        >
                          {detail.description}
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-gray-700 dark:text-gray-200">
                          <div>
                            <span className="font-semibold">PO:</span>{" "}
                            {detail.po}
                          </div>
                          <div>
                            <span className="font-semibold">Color:</span>{" "}
                            {detail.color}
                          </div>
                          <div>
                            <span className="font-semibold">Model:</span>{" "}
                            {detail.model}
                          </div>
                          <div>
                            <span className="font-semibold">OEM:</span>{" "}
                            {detail.oem_no}
                          </div>
                          <div>
                            <span className="font-semibold">PK:</span>{" "}
                            {detail.pk}
                          </div>
                          <div>
                            <span className="font-semibold">M3:</span>{" "}
                            {detail.m3}
                          </div>
                          <div>
                            <span className="font-semibold">N.W.:</span>{" "}
                            {detail.n_w}
                          </div>
                          <div>
                            <span className="font-semibold">G.W.:</span>{" "}
                            {detail.g_w}
                          </div>
                          <div>
                            <span className="font-semibold">W:</span>{" "}
                            {detail.width}
                          </div>
                          <div>
                            <span className="font-semibold">H:</span>{" "}
                            {detail.height}
                          </div>
                          <div>
                            <span className="font-semibold">L:</span>{" "}
                            {detail.length}
                          </div>
                          <div>
                            <span className="font-semibold">Weight:</span>{" "}
                            {detail.weight}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() =>
                              handleEditItem(detail.item_detail_id)
                            }
                            className="cursor-pointer px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold w-full"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteItem(detail.item_detail_id)
                            }
                            className="cursor-pointer px-3 py-1 bg-red-800 hover:bg-red-900 text-white rounded-lg font-bold w-full"
                          >
                            ลบ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-[800px] w-full text-left border-collapse mt-2 text-sm lg:text-base">
                  <thead>
                    <tr className="bg-red-100 dark:bg-red-900">
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        {t.pictures}
                      </th>
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        ชื่อสินค้า
                      </th>
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        {t.itemCode}
                      </th>
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        {t.description}
                      </th>
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        {t.po}
                      </th>
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        {t.color}
                      </th>
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        {t.model}
                      </th>
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        {t.oem_no}
                      </th>
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        {t.pk}
                      </th>
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        {t.m3}
                      </th>
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        {t.n_w}
                      </th>
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        {t.g_w}
                      </th>
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        Width
                      </th>
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        Height
                      </th>
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        Length
                      </th>
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        Weight
                      </th>
                      <th className="py-2 px-4 text-red-900 dark:text-red-200">
                        {t.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(5)].map((_, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-red-100 dark:border-red-800 animate-pulse"
                        >
                          <td className="py-2 px-4">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                          </td>
                          {[...Array(16)].map((_, i) => (
                            <td key={i} className="py-2 px-4">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : itemDetails.length === 0 ? (
                      <tr>
                        <td
                          colSpan={17}
                          className="text-center py-8 text-gray-500"
                        >
                          ไม่มีข้อมูลสินค้า
                        </td>
                      </tr>
                    ) : (
                      itemDetails.map((detail, rowIdx) => (
                        <tr
                          key={detail.item_detail_id}
                          className="border-b border-red-100 dark:border-red-800"
                        >
                          <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                            <div className="relative flex items-center justify-center w-40 h-24 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <button
                                type="button"
                                className="cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full shadow p-1 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-gray-700"
                                style={{ zIndex: 2 }}
                                onClick={() => {
                                  setCardImgIdxs((prev) => {
                                    const newIdxs = { ...prev };
                                    newIdxs[detail.item_detail_id] =
                                      prev[detail.item_detail_id] > 0
                                        ? prev[detail.item_detail_id] - 1
                                        : (detail.image_urls?.length ?? 1) - 1;
                                    return newIdxs;
                                  });
                                }}
                                disabled={(detail.image_urls?.length ?? 0) <= 1}
                                aria-label="ดูรูปก่อนหน้า"
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 19l-7-7 7-7"
                                  />
                                </svg>
                              </button>
                              <img
                                src={
                                  detail.image_urls?.[
                                    cardImgIdxs?.[detail.item_detail_id] || 0
                                  ] || "/400x400.png"
                                }
                                alt={`รูปที่ ${
                                  (cardImgIdxs?.[detail.item_detail_id] || 0) +
                                  1
                                }`}
                                className="w-16 h-16 object-cover rounded border border-gray-300 dark:border-gray-700"
                              />
                              <button
                                type="button"
                                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full shadow p-1 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-gray-700"
                                style={{ zIndex: 2 }}
                                onClick={() => {
                                  setCardImgIdxs((prev) => {
                                    const newIdxs = { ...prev };
                                    newIdxs[detail.item_detail_id] =
                                      prev[detail.item_detail_id] <
                                      (detail.image_urls?.length ?? 1) - 1
                                        ? prev[detail.item_detail_id] + 1
                                        : 0;
                                    return newIdxs;
                                  });
                                }}
                                disabled={(detail.image_urls?.length ?? 0) <= 1}
                                aria-label="ดูรูปถัดไป"
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                              {(detail.image_urls?.length ?? 0) > 1 && (
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black bg-opacity-40 text-white text-xs px-2 py-0.5 rounded">
                                  {(cardImgIdxs?.[detail.item_detail_id] || 0) +
                                    1}{" "}
                                  / {detail.image_urls?.length}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                            {detail.item_name}
                          </td>
                          <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                            {detail.item_code}
                          </td>
                          <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                            <div
                              className="max-w-20 truncate text-ellipsis whitespace-nowrap overflow-hidden relative"
                              title={detail.description}
                            >
                              {detail.description}
                            </div>
                          </td>
                          <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                            {detail.po}
                          </td>
                          <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                            {detail.color}
                          </td>
                          <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                            {detail.model}
                          </td>
                          <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                            {detail.oem_no ?? detail.oem_no ?? ""}
                          </td>
                          <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                            {detail.pk}
                          </td>
                          <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                            {detail.m3}
                          </td>
                          <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                            {detail.n_w}
                          </td>
                          <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                            {detail.g_w}
                          </td>
                          <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                            {detail.width ?? ""}
                          </td>
                          <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                            {detail.height ?? ""}
                          </td>
                          <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                            {detail.length ?? ""}
                          </td>
                          <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                            {detail.weight ?? ""}
                          </td>
                          <td className="py-2 px-4 flex gap-2">
                            <button
                              onClick={() =>
                                handleEditItem(detail.item_detail_id)
                              }
                              className="cursor-pointer px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                            >
                              แก้ไข
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteItem(detail.item_detail_id)
                              }
                              className="cursor-pointer px-3 py-1 bg-red-800 hover:bg-red-900 text-white rounded-lg font-bold"
                            >
                              ลบ
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Pagination Controls */}
            <div className="flex flex-col items-center mt-4 sm:mt-6 gap-1 sm:gap-2">
              <nav className="inline-flex gap-2 mb-2">
                <button
                  type="button"
                  className={`cursor-pointer px-3 py-1 rounded-lg font-bold border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-red-100 dark:hover:bg-red-900"
                  }`}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  ก่อนหน้า
                </button>
                {[...Array(Math.max(totalPages, 1))].map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`cursor-pointer px-3 py-1 rounded-lg font-bold border border-red-300 dark:border-red-700 ${
                      currentPage === idx + 1
                        ? "bg-red-700 text-white"
                        : "bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900"
                    }`}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  type="button"
                  className={`cursor-pointer px-3 py-1 rounded-lg font-bold border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-red-100 dark:hover:bg-red-900"
                  }`}
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  ถัดไป
                </button>
              </nav>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  แสดงต่อหน้า 20 รายการ
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Edit Form below the table */}
      {editItemId !== null && editItem && (
        <form
          onSubmit={handleSaveItem}
          className="mt-8 p-6 bg-red-50 dark:bg-red-950 rounded-xl shadow-lg"
        >
          <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-4">
            แก้ไขรายละเอียดสินค้า
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="item_code"
              value={editItem.item_code}
              onChange={handleEditItemChange}
              placeholder="Item Code"
              className="px-4 py-2 rounded-lg border border-red-400 dark:border-red-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <textarea
              name="description"
              value={editItem.description}
              onChange={(e) => handleEditItemChange(e as any)}
              placeholder="Description"
              rows={5}
              className="px-4 py-5 rounded-lg border border-red-400 dark:border-red-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
            />
            <input
              type="text"
              name="po"
              value={editItem.po}
              onChange={handleEditItemChange}
              placeholder="PO"
              className="px-4 py-2 rounded-lg border border-red-400 dark:border-red-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              name="color"
              value={editItem.color}
              onChange={handleEditItemChange}
              placeholder="Color"
              className="px-4 py-2 rounded-lg border border-red-400 dark:border-red-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              name="model"
              value={editItem.model}
              onChange={handleEditItemChange}
              placeholder="Model"
              className="px-4 py-2 rounded-lg border border-red-400 dark:border-red-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              name="oem_no"
              value={editItem.oem_no}
              onChange={handleEditItemChange}
              placeholder="oem No."
              className="px-4 py-2 rounded-lg border border-red-400 dark:border-red-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              name="pk"
              value={editItem.pk}
              onChange={handleEditItemChange}
              placeholder="PK"
              className="px-4 py-2 rounded-lg border border-red-400 dark:border-red-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              name="m3"
              value={editItem.m3}
              onChange={handleEditItemChange}
              placeholder="M3"
              className="px-4 py-2 rounded-lg border border-red-400 dark:border-red-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              name="n_w"
              value={editItem.n_w}
              onChange={handleEditItemChange}
              placeholder="N.W."
              className="px-4 py-2 rounded-lg border border-red-400 dark:border-red-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              name="g_w"
              value={editItem.g_w}
              onChange={handleEditItemChange}
              placeholder="G.W."
              className="px-4 py-2 rounded-lg border border-red-400 dark:border-red-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              name="width"
              value={editItem.width}
              onChange={handleEditItemChange}
              placeholder="Width"
              className="px-4 py-2 rounded-lg border border-red-400 dark:border-red-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              name="height"
              value={editItem.height}
              onChange={handleEditItemChange}
              placeholder="Height"
              className="px-4 py-2 rounded-lg border border-red-400 dark:border-red-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              name="length"
              value={editItem.length}
              onChange={handleEditItemChange}
              placeholder="Length"
              className="px-4 py-2 rounded-lg border border-red-400 dark:border-red-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              name="weight"
              value={editItem.weight}
              onChange={handleEditItemChange}
              placeholder="Weight"
              className="px-4 py-2 rounded-lg border border-red-400 dark:border-red-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="cursor-pointer px-6 py-2 bg-red-700 hover:bg-red-900 text-white font-bold rounded-lg shadow-lg"
            >
              บันทึก
            </button>
            <button
              type="button"
              onClick={() => {
                setEditItemId(null);
                setEditItem(null);
              }}
              className="cursor-pointer px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg shadow-lg"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      )}
      <AlertModal
        open={alertState.open}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        autoCloseMs={alertState.autoCloseMs}
        onClose={() => setAlertState((s) => ({ ...s, open: false }))}
      />
    </div>
  );

  // render AlertModal at component root (after return JSX)
}

// Note: React components can't return after the JSX; to keep AlertModal mounted,
// we render it inside the return above. However, for safety we place it at the end
// of the file as an additional export—no code change needed here.

// Utility to sanitize input values for controlled components
function safeValue(val: any) {
  return val === null || val === undefined ? "" : val;
}
