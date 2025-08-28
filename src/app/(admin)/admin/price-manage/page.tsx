"use client";
import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";
import ApiService from "@/utils/ApiService";
import AlertModal from "@/component/AlertModal";
// Dummy import for product data, replace with actual import if needed
// import { ItemDetail } from "../items-manage/page";

interface PriceItem {
  item_code: string;
  price_type: string;
  client_type: string;
  price: number;
  stock: number;
  sold: number;
  client_type_id?: number; // Optional for client_type_id
}

export default function PriceManage() {
  const [filterType, setFilterType] = useState<string>("");
  const [filterClient, setFilterClient] = useState<string>("");
  const [filterSortBy, setFilterSortBy] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<PriceItem | null>(null);
  const [products, setProducts] = useState<
    { item_code: string; name?: string }[]
  >([]);
  const [clientTypes, setClientTypes] = useState<
    { client_type_id: number; client_type_name: string; description?: string }[]
  >([]);
  // Skeleton loading state
  const [loading, setLoading] = useState(true);
  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      ApiService.getAllItemCodes(),
      ApiService.getAllClientTypes(),
      ApiService.getAllItemPrices(),
    ]).then(([itemRes, clientRes, priceRes]) => {
      if (itemRes.success && Array.isArray(itemRes.data)) {
        setProducts(itemRes.data);
      }
      if (clientRes.success && Array.isArray(clientRes.data)) {
        setClientTypes(clientRes.data);
      }
      if (priceRes.success && Array.isArray(priceRes.data)) {
        setPriceItems(priceRes.data);
      }
      setLoading(false);
    });
  }, []);
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [form, setForm] = useState({
    price_type: "",
    client_type: "",
    price: "",
    stock: "",
  });
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  // Alert modal state (like item-code-manage)
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState<string | undefined>(undefined);
  const [alertType, setAlertType] = useState<
    "success" | "error" | "info" | "warning" | "delete"
  >("info");
  const [alertAutoCloseMs, setAlertAutoCloseMs] = useState<number | null>(4000);

  const showAlert = (
    message: string,
    type: "success" | "error" | "info" | "warning" | "delete" = "info",
    title?: string,
    autoCloseMs: number | null = 4000
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertAutoCloseMs(autoCloseMs);
    setAlertOpen(true);
  };
  // Auto-update stock value in form when item_code, price_type, or client_type changes (only if not editing)
  React.useEffect(() => {
    if (editIdx === null && selectedCode) {
      const found = priceItems.find((i) => i.item_code === selectedCode);
      setForm((prev) => ({
        ...prev,
        stock: found ? found.stock.toString() : "",
      }));
    }
  }, [editIdx, selectedCode, form.price_type, form.client_type, priceItems]);
  const { language } = useLanguage();
  const t = translations[language].pricemanage;
  // Pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }
  console.log("price item", priceItems);
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Form submitted:", form);
    console.log("priceItems:", priceItems);
    if (!selectedCode) return;
    // Prevent duplicate item_code + client_type + price_type
    const isDuplicate = priceItems.some(
      (item) =>
        item.item_code === selectedCode &&
        String(item.client_type_id) === String(form.client_type) &&
        item.price_type === form.price_type
    );
    if (editIdx === null && isDuplicate) {
      showAlert(
        "รายการนี้มีอยู่แล้ว ไม่สามารถเพิ่มซ้ำได้",
        "warning",
        "แจ้งเตือน"
      );
      return;
    }
    const payload = {
      item_code: selectedCode,
      price_type: form.price_type,
      client_type_id: Number(form.client_type),
      price: Number(form.price),
      stock: Number(form.stock),
    };
    if (editIdx !== null && editItem && (editItem as any).item_price_id) {
      // อัพเดตข้อมูล
      ApiService.updateItemPrice((editItem as any).item_price_id, payload).then(
        (res) => {
          if (res.success) {
            ApiService.getAllItemPrices().then((res2) => {
              if (res2.success && Array.isArray(res2.data)) {
                setPriceItems(res2.data);
              }
            });
            setForm({ price_type: "", client_type: "", price: "", stock: "" });
            setSelectedCode("");
            setEditIdx(null);
            setEditItem(null);
          } else {
            showAlert(
              res.message || "เกิดข้อผิดพลาดในการอัพเดตราคา",
              "error",
              "ข้อผิดพลาด"
            );
          }
        }
      );
    } else {
      // เพิ่มข้อมูลใหม่
      ApiService.addItemPrice(payload).then((res) => {
        if (res.success) {
          setPriceItems([
            ...priceItems,
            {
              item_code: res.data.item_code,
              price_type: res.data.price_type,
              client_type: res.data.client_type, // use name for display
              client_type_id: res.data.client_type_id, // keep id for logic
              price: res.data.price,
              stock: Number(form.stock),
              sold: 0,
            },
          ]);
          setForm({ price_type: "", client_type: "", price: "", stock: "" });
          setSelectedCode("");
        } else {
          showAlert(
            res.message || "เกิดข้อผิดพลาดในการเพิ่มราคาสินค้า",
            "error",
            "ข้อผิดพลาด"
          );
        }
      });
    }
  }

  function handleEdit(idx: number) {
    setEditIdx(idx);
    setEditItem({ ...priceItems[idx] });
    const item = priceItems[idx];
    setForm({
      price_type: item.price_type,
      client_type: item.client_type_id ? String(item.client_type_id) : "",
      price: item.price.toString(),
      stock: item.stock.toString(),
    });
    setSelectedCode(item.item_code);
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setEditItem((prev) =>
      prev
        ? {
            ...prev,
            [name]:
              name === "price" || name === "stock" ? Number(value) : value,
          }
        : prev
    );
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (editIdx !== null && editItem) {
      setPriceItems((prev) =>
        prev.map((item, idx) => (idx === editIdx ? { ...editItem } : item))
      );
      setEditIdx(null);
      setEditItem(null);
    }
  }

  function handleDelete(idx: number) {
    const item = priceItems[idx];
    if (item && (item as any).item_price_id) {
      ApiService.deleteItemPrice((item as any).item_price_id).then((res) => {
        if (res.success) {
          ApiService.getAllItemPrices().then((res2) => {
            if (res2.success && Array.isArray(res2.data)) {
              setPriceItems(res2.data);
            }
          });
        } else {
          showAlert(
            res.message || "เกิดข้อผิดพลาดในการลบราคาสินค้า",
            "error",
            "ข้อผิดพลาด"
          );
        }
      });
    } else {
      setPriceItems((prev) => prev.filter((_, i) => i !== idx));
    }
    if (editIdx === idx) {
      setEditIdx(null);
      setEditItem(null);
    }
  }

  return (
    <div className="w-full max-w-8xl mx-auto bg-white dark:bg-gray-900  p-8 mt-25 mb-45">
      <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-6 text-center">
        {t.title}
      </h2>
      <form
        className="flex flex-row gap-4 items-end flex-wrap"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col min-w-[180px]">
          <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
            {t.selectProduct}
          </label>
          {loading ? (
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ) : (
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">-- เลือกสินค้า --</option>
              {products.map((p) => (
                <option key={p.item_code} value={p.item_code}>
                  {p.item_code}
                  {p.name ? ` - ${p.name}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex flex-col min-w-[140px]">
          <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
            {t.priceType}
          </label>
          {loading ? (
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ) : (
            <select
              name="price_type"
              value={form.price_type}
              onChange={handleFormChange}
              className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="">-- เลือกประเภทราคา --</option>
              <option value="Standard">Standard</option>
              <option value="Promotion">Promotion</option>
            </select>
          )}
        </div>
        <div className="flex flex-col min-w-[140px]">
          <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
            {t.clientType}
          </label>
          {loading ? (
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ) : (
            <select
              name="client_type"
              value={form.client_type}
              onChange={handleFormChange}
              className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="">-- เลือกประเภทลูกค้า --</option>
              {clientTypes.map((ct) => (
                <option key={ct.client_type_name} value={ct.client_type_id}>
                  {ct.client_type_name}{" "}
                  {ct.description ? `- ${ct.description}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex flex-col min-w-[120px]">
          <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
            {t.price}
          </label>
          {loading ? (
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ) : (
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleFormChange}
              className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
          )}
        </div>
        <div className="flex flex-col min-w-[120px]">
          <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
            {t.stock}
          </label>
          {loading ? (
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ) : (
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleFormChange}
              className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-red-700 hover:bg-red-900 text-white font-bold rounded-lg shadow-lg transition-all text-lg"
          disabled={!selectedCode}
        >
          {editIdx !== null ? t.save : t.addPrice}
        </button>
        {editIdx !== null && (
          <button
            type="button"
            className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg shadow-lg transition-all text-lg ml-2"
            onClick={() => {
              setEditIdx(null);
              setEditItem(null);
              setForm({
                price_type: "",
                client_type: "",
                price: "",
                stock: "",
              });
              setSelectedCode("");
            }}
          >
            {t.cancel}
          </button>
        )}
      </form>
      {/* Show added price items below */}
      <div className="mt-10 flex-1 flex flex-col justify-between">
        {/* Filter and Search Controls */}
        <div className="flex flex-row gap-4 mb-6 items-end flex-wrap">
          <div className="flex flex-col min-w-[160px]">
            <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
              {t.priceType}
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">-- ทั้งหมด --</option>
              {[...new Set(priceItems.map((item) => item.price_type))].map(
                (type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="flex flex-col min-w-[160px]">
            <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
              {t.clientType}
            </label>
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">-- ทั้งหมด --</option>
              {clientTypes.map((ct) => (
                <option key={ct.client_type_name} value={ct.client_type_name}>
                  {ct.client_type_name}{" "}
                  {ct.description ? `- ${ct.description}` : ""}
                </option>
              ))}
            </select>
          </div>
          {/* Filter & Sort By Select */}
          <div className="flex flex-col min-w-[220px]">
            <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
              {t.filterSortBy}
            </label>
            <select
              value={filterSortBy}
              onChange={(e) => setFilterSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">-- เลือก --</option>
              <option value="minPrice">{t.minPrice}</option>
              <option value="maxPrice">{t.maxPrice}</option>
              <option value="minStock">{t.minStock}</option>
              <option value="maxStock">{t.maxStock}</option>
            </select>
          </div>
          <div className="flex flex-col min-w-[220px]">
            <label className="mb-1 font-semibold text-red-700 dark:text-red-300">
              {t.search}
            </label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
          {t.priceList}
        </h3>
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="bg-red-100 dark:bg-red-900">
              <th className="py-2 px-4 text-red-900 dark:text-red-200">
                item_code
              </th>
              <th className="py-2 px-4 text-red-900 dark:text-red-200">
                {t.priceType}
              </th>
              <th className="py-2 px-4 text-red-900 dark:text-red-200">
                {t.clientType}
              </th>
              <th className="py-2 px-4 text-red-900 dark:text-red-200">
                {t.price}
              </th>
              <th className="py-2 px-4 text-red-900 dark:text-red-200">
                {t.stock}
              </th>
              <th className="py-2 px-4 text-red-900 dark:text-red-200">
                {t.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={6} className="py-4">
                      <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              : (() => {
                  // ...existing code...
                  let filtered = priceItems;
                  if (filterType) {
                    filtered = filtered.filter(
                      (item) => item.price_type === filterType
                    );
                  }
                  if (filterClient) {
                    filtered = filtered.filter((item) => {
                      const ct = clientTypes.find(
                        (c) =>
                          String(c.client_type_id) ===
                          String(item.client_type_id)
                      );
                      return ct && ct.client_type_name === filterClient;
                    });
                  }
                  // Sort by selected criteria
                  if (filterSortBy && filtered.length > 0) {
                    if (filterSortBy === "minPrice") {
                      filtered = [...filtered].sort(
                        (a, b) => a.price - b.price
                      );
                    }
                    if (filterSortBy === "maxPrice") {
                      filtered = [...filtered].sort(
                        (a, b) => b.price - a.price
                      );
                    }
                    if (filterSortBy === "minStock") {
                      filtered = [...filtered].sort(
                        (a, b) => a.stock - b.stock
                      );
                    }
                    if (filterSortBy === "maxStock") {
                      filtered = [...filtered].sort(
                        (a, b) => b.stock - a.stock
                      );
                    }
                  }
                  if (searchText.trim()) {
                    const lower = searchText.trim().toLowerCase();
                    filtered = filtered.filter(
                      (item) =>
                        item.item_code.toLowerCase().includes(lower) ||
                        (() => {
                          const ct = clientTypes.find(
                            (c) =>
                              String(c.client_type_id) ===
                              String(item.client_type_id)
                          );
                          return (
                            ct &&
                            ct.client_type_name.toLowerCase().includes(lower)
                          );
                        })() ||
                        item.price_type.toLowerCase().includes(lower)
                    );
                  }
                  // Pagination logic
                  const totalPages = Math.max(
                    1,
                    Math.ceil(filtered.length / itemsPerPage)
                  );
                  const paged = filtered.slice(
                    (page - 1) * itemsPerPage,
                    page * itemsPerPage
                  );
                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-4 text-center text-gray-500"
                        >
                          {t.noData}
                        </td>
                      </tr>
                    );
                  }
                  return paged.map((item, idx) => {
                    // ...existing code...
                    const origIdx = priceItems.findIndex(
                      (i) =>
                        i.item_code === item.item_code &&
                        i.price_type === item.price_type &&
                        i.client_type_id === item.client_type_id
                    );
                    const ct = clientTypes.find(
                      (c) =>
                        String(c.client_type_id) === String(item.client_type_id)
                    );
                    return (
                      <tr
                        key={
                          item.item_code + item.price_type + item.client_type_id
                        }
                        className={
                          editIdx === origIdx ? "bg-red-50 dark:bg-red-950" : ""
                        }
                      >
                        <td className="py-2 px-4 font-mono">
                          {item.item_code}
                        </td>
                        <td className="py-2 px-4">
                          {item.price_type ? (
                            <span
                              className={
                                "inline-block px-2 py-1 rounded-full font-semibold text-sm " +
                                (item.price_type === "Promotion"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300"
                                  : item.price_type === "Standard"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200")
                              }
                            >
                              {item.price_type}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="py-2 px-4">
                          {ct ? ct.client_type_name : item.client_type_id}
                        </td>
                        <td className="py-2 px-4">{item.price}</td>
                        <td className="py-2 px-4">{item.stock}</td>
                        <td className="py-2 px-4 flex gap-2">
                          <button
                            type="button"
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm"
                            onClick={() => handleEdit(origIdx)}
                            disabled={editIdx !== null}
                          >
                            {t.edit}
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 bg-red-800 hover:bg-red-900 text-white rounded-lg font-bold text-sm"
                            onClick={() => handleDelete(origIdx)}
                            disabled={editIdx !== null}
                          >
                            {t.delete}
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })()}
          </tbody>
        </table>
        {/* Pagination Controls centered below table */}
        <div className="flex justify-center items-center gap-2 mb-4">
          <button
            type="button"
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-300 dark:hover:bg-gray-600"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t.prev}
          </button>
          <span className="font-bold text-red-700 dark:text-red-300">
            {t.page} {page}
          </span>
          <button
            type="button"
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={() => setPage((p) => p + 1)}
            disabled={(() => {
              let filtered = priceItems;
              if (filterType)
                filtered = filtered.filter(
                  (item) => item.price_type === filterType
                );
              if (filterClient)
                filtered = filtered.filter(
                  (item) => item.client_type === filterClient
                );
              if (searchText.trim()) {
                const lower = searchText.trim().toLowerCase();
                filtered = filtered.filter(
                  (item) =>
                    item.item_code.toLowerCase().includes(lower) ||
                    item.client_type.toLowerCase().includes(lower) ||
                    item.price_type.toLowerCase().includes(lower)
                );
              }
              return page >= Math.ceil(filtered.length / itemsPerPage);
            })()}
          >
            {t.next}
          </button>
        </div>
      </div>
      {/* Alert modal host */}
      <AlertModal
        open={alertOpen}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        autoCloseMs={alertAutoCloseMs}
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}
