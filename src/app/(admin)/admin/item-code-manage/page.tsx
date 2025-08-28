"use client";
import React, { useState } from "react";
import AlertModal from "@/component/AlertModal";

export default function ItemCodeManagePage() {
  const [page, setPage] = useState(0);
  // State declarations...
  const [carBrand, setCarBrand] = useState({
    car_brand_abbr: "",
    car_brand_name: "",
  });
  const [carYear, setCarYear] = useState({ car_year_abbr: "", car_year: "" });
  const [carType, setCarType] = useState({ car_type_code: "", car_type: "" });
  // ...existing code...
  const [carVersion, setCarVersion] = useState({
    car_type_code: "",
    car_format_code: "",
    car_version_code: "",
    car_version: "",
  });
  const [carCategory, setCarCategory] = useState({
    car_category_abbr: "",
    car_category: "",
    car_category_detail: "",
  });
  const [carSide, setCarSide] = useState({ car_side_code: "", car_side: "" });
  const [carFeature, setCarFeature] = useState({
    car_feature_abbr: "",
    car_feature: "",
    car_feature_detail: "",
  });
  // Data for tables
  const [carBrandList, setCarBrandList] = useState<string[][]>([]);
  const [carYearList, setCarYearList] = useState<string[][]>([]);
  const [carTypeList, setCarTypeList] = useState<string[][]>([]);
  const [carVersionList, setCarVersionList] = useState<string[][]>([]);
  const [carCategoryList, setCarCategoryList] = useState<string[][]>([]);
  const [carSideList, setCarSideList] = useState<string[][]>([]);
  const [carFeatureList, setCarFeatureList] = useState<string[][]>([]);

  // Alert modal state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState<string | undefined>(undefined);
  const [alertType, setAlertType] = useState<
    "success" | "error" | "info" | "warning" | "delete"
  >("info");
  const [alertAutoCloseMs, setAlertAutoCloseMs] = useState<number | null>(4000);

  // Helper to reload data for current section
  const reloadCurrentSection = async () => {
    const ApiService = (await import("@/utils/ApiService")).default;
    switch (sections[page].key) {
      case "carBrand":
        ApiService.getAllCarBrands().then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setCarBrandList(
              res.data.map((item: any) => [
                String(item.car_brand_id),
                item.car_brand_abbr,
                item.car_brand_name,
              ])
            );
          }
        });
        break;
      case "carYear":
        ApiService.getAllCarYears().then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setCarYearList(
              res.data.map((item: any) => [
                String(item.car_year_id),
                item.car_year_abbr,
                item.car_year,
              ])
            );
          }
        });
        break;
      case "carType":
        ApiService.getAllCarTypes().then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setCarTypeList(
              res.data.map((item: any) => [
                String(item.car_type_id),
                item.car_type_code,
                item.car_type,
              ])
            );
          }
        });
        break;
      case "carVersion":
        ApiService.getAllCarVersions().then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setCarVersionList(
              res.data.map((item: any) => [
                String(item.car_version_id),
                item.car_type_code,
                item.car_format_code ?? "",
                item.car_version_code,
                item.car_version,
              ])
            );
          }
        });
        break;
      case "carCategory":
        ApiService.getAllCarCategories().then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setCarCategoryList(
              res.data.map((item: any) => [
                String(item.car_category_id),
                item.car_category_abbr,
                item.car_category,
                item.car_category_detail,
              ])
            );
          }
        });
        break;
      case "carSide":
        ApiService.getAllCarSides().then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setCarSideList(
              res.data.map((item: any) => [
                String(item.car_side_id),
                item.car_side_code,
                item.car_side,
              ])
            );
          }
        });
        break;
      case "carFeature":
        ApiService.getAllCarFeatures().then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setCarFeatureList(
              res.data.map((item: any) => [
                String(item.car_feature_id),
                item.car_feature_abbr,
                item.car_feature,
                item.car_feature_detail,
              ])
            );
          }
        });
        break;
      default:
        break;
    }
  };

  React.useEffect(() => {
    reloadCurrentSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const sections = [
    {
      key: "carBrand",
      title: "Car Brand",
      inputs: [
        {
          label: "Abbr",
          value: carBrand.car_brand_abbr,
          field: "car_brand_abbr",
        },
        {
          label: "Name",
          value: carBrand.car_brand_name,
          field: "car_brand_name",
        },
      ],
      tableHeaders: ["ID", "Abbr", "Name"],
      tableData: carBrandList,
    },
    {
      key: "carYear",
      title: "Car Year",
      inputs: [
        { label: "Abbr", value: carYear.car_year_abbr, field: "car_year_abbr" },
        { label: "Year", value: carYear.car_year, field: "car_year" },
      ],
      tableHeaders: ["ID", "Abbr", "Year"],
      tableData: carYearList,
    },
    {
      key: "carType",
      title: "Car Type",
      inputs: [
        { label: "Code", value: carType.car_type_code, field: "car_type_code" },
        { label: "Type", value: carType.car_type, field: "car_type" },
      ],
      tableHeaders: ["ID", "Code", "Type"],
      tableData: carTypeList,
    },
    {
      key: "carVersion",
      title: "Car Version",
      inputs: [
        {
          label: "Type Code",
          value: carVersion.car_type_code,
          field: "car_type_code",
        },
        {
          label: "Format Code",
          value: carVersion.car_format_code ?? "",
          field: "car_format_code",
        },
        {
          label: "Version Code",
          value: carVersion.car_version_code,
          field: "car_version_code",
        },
        {
          label: "Version",
          value: carVersion.car_version,
          field: "car_version",
        },
      ],
      tableHeaders: [
        "ID",
        "Type Code",
        "Format Code",
        "Version Code",
        "Version",
      ],
      tableData: carVersionList,
    },
    {
      key: "carCategory",
      title: "Car Category",
      inputs: [
        {
          label: "Abbr",
          value: carCategory.car_category_abbr,
          field: "car_category_abbr",
        },
        {
          label: "Category",
          value: carCategory.car_category,
          field: "car_category",
        },
        {
          label: "Detail",
          value: carCategory.car_category_detail,
          field: "car_category_detail",
        },
      ],
      tableHeaders: ["ID", "Abbr", "Category", "Detail"],
      tableData: carCategoryList,
    },
    {
      key: "carSide",
      title: "Car Side",
      inputs: [
        { label: "Code", value: carSide.car_side_code, field: "car_side_code" },
        { label: "Side", value: carSide.car_side, field: "car_side" },
      ],
      tableHeaders: ["ID", "Code", "Side"],
      tableData: carSideList,
    },
    {
      key: "carFeature",
      title: "Car Feature",
      inputs: [
        {
          label: "Abbr",
          value: carFeature.car_feature_abbr,
          field: "car_feature_abbr",
        },
        {
          label: "Feature",
          value: carFeature.car_feature,
          field: "car_feature",
        },
        {
          label: "Detail",
          value: carFeature.car_feature_detail,
          field: "car_feature_detail",
        },
      ],
      tableHeaders: ["ID", "Abbr", "Feature", "Detail"],
      tableData: carFeatureList,
    },
  ];

  // ...existing code...

  // Generic input handler
  function handleChange(section: string, field: string, value: string) {
    switch (section) {
      case "carBrand":
        setCarBrand({ ...carBrand, [field]: value });
        break;
      case "carYear":
        setCarYear({
          ...carYear,
          [field]: field === "car_year" ? String(value) : value,
        });
        break;
      case "carType":
        setCarType({ ...carType, [field]: value });
        break;
      case "carVersion":
        setCarVersion({ ...carVersion, [field]: value });
        break;
      case "carCategory":
        setCarCategory({ ...carCategory, [field]: value });
        break;
      case "carSide":
        setCarSide({ ...carSide, [field]: value });
        break;
      case "carFeature":
        setCarFeature({ ...carFeature, [field]: value });
        break;
      default:
        break;
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10 my-30">
      <div className="w-full max-w-7xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-extrabold text-red-700 dark:text-red-300 mb-8">
          Item Code Management
        </h1>
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {sections.map((s, idx) => (
            <button
              key={s.key}
              className={`cursor-pointer px-4 py-2 rounded-lg font-bold text-lg transition border-2 ${
                page === idx
                  ? "bg-red-600 text-white border-red-700"
                  : "bg-white text-red-700 border-red-300 hover:bg-red-50"
              }`}
              onClick={() => setPage(idx)}
            >
              {s.title}
            </button>
          ))}
        </div>
        <Section title={sections[page].title}>
          {sections[page].inputs.map((input) => (
            <Input
              key={input.field}
              label={input.label}
              value={input.value}
              onChange={(v: string) =>
                handleChange(sections[page].key, input.field, v)
              }
            />
          ))}
        </Section>
        <DataTable
          headers={sections[page].tableHeaders}
          data={sections[page].tableData}
          sectionKey={sections[page].key}
          onDelete={async (id: string) => {
            const ApiService = (await import("@/utils/ApiService")).default;
            let result;
            switch (sections[page].key) {
              case "carBrand":
                result = await ApiService.deleteCarBrand(Number(id));
                break;
              case "carYear":
                result = await ApiService.deleteCarYear(Number(id));
                break;
              case "carType":
                result = await ApiService.deleteCarType(Number(id));
                break;
              case "carVersion":
                result = await ApiService.deleteCarVersion(Number(id));
                break;
              case "carCategory":
                result = await ApiService.deleteCarCategory(Number(id));
                break;
              case "carSide":
                result = await ApiService.deleteCarSide(Number(id));
                break;
              case "carFeature":
                result = await ApiService.deleteCarFeature(Number(id));
                break;
              default:
                result = { success: false, message: "Unknown section" };
            }
            if (result.success) {
              setAlertTitle("สำเร็จ");
              setAlertMessage("ลบสำเร็จ");
              setAlertType("delete");
              setAlertAutoCloseMs(2000);
              setAlertOpen(true);
              await reloadCurrentSection();
            } else {
              setAlertTitle("ข้อผิดพลาด");
              setAlertMessage(
                `เกิดข้อผิดพลาด: ${result.message || "ไม่สำเร็จ"}`
              );
              setAlertType("error");
              setAlertAutoCloseMs(null);
              setAlertOpen(true);
            }
          }}
        />
        <div className="flex justify-end mt-4">
          <button
            className="cursor-pointer px-6 py-2 rounded-lg bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition shadow"
            onClick={async () => {
              const section = sections[page];
              let result;
              try {
                const ApiService = (await import("@/utils/ApiService")).default;
                switch (section.key) {
                  case "carBrand":
                    result = await ApiService.addCarBrand({
                      car_brand_abbr: carBrand.car_brand_abbr,
                      car_brand_name: carBrand.car_brand_name,
                    });
                    break;
                  case "carYear":
                    result = await ApiService.addCarYear(carYear);
                    break;
                  case "carType":
                    result = await ApiService.addCarType(carType);
                    break;
                  case "carVersion":
                    result = await ApiService.addCarVersion(carVersion);
                    break;
                  case "carCategory":
                    result = await ApiService.addCarCategory(carCategory);
                    break;
                  case "carSide":
                    result = await ApiService.addCarSide(carSide);
                    break;
                  case "carFeature":
                    result = await ApiService.addCarFeature(carFeature);
                    break;
                  default:
                    result = { success: false, message: "Unknown section" };
                }
                if (result.success) {
                  setAlertTitle("สำเร็จ");
                  setAlertMessage(`บันทึกสำเร็จ: ${section.title}`);
                  setAlertType("success");
                  setAlertAutoCloseMs(2000);
                  setAlertOpen(true);
                  await reloadCurrentSection();
                  // clear inputs for the current section after successful add
                  switch (section.key) {
                    case "carBrand":
                      setCarBrand({ car_brand_abbr: "", car_brand_name: "" });
                      break;
                    case "carYear":
                      setCarYear({ car_year_abbr: "", car_year: "" });
                      break;
                    case "carType":
                      setCarType({ car_type_code: "", car_type: "" });
                      break;
                    case "carVersion":
                      setCarVersion({
                        car_type_code: "",
                        car_format_code: "",
                        car_version_code: "",
                        car_version: "",
                      });
                      break;
                    case "carCategory":
                      setCarCategory({
                        car_category_abbr: "",
                        car_category: "",
                        car_category_detail: "",
                      });
                      break;
                    case "carSide":
                      setCarSide({ car_side_code: "", car_side: "" });
                      break;
                    case "carFeature":
                      setCarFeature({
                        car_feature_abbr: "",
                        car_feature: "",
                        car_feature_detail: "",
                      });
                      break;
                    default:
                      break;
                  }
                } else {
                  setAlertTitle("ข้อผิดพลาด");
                  setAlertMessage(
                    `เกิดข้อผิดพลาด: ${result.message || "ไม่สำเร็จ"}`
                  );
                  setAlertType("error");
                  setAlertAutoCloseMs(null);
                  setAlertOpen(true);
                }
              } catch (err) {
                setAlertTitle("ข้อผิดพลาด");
                setAlertMessage(`เกิดข้อผิดพลาด: ${(err as Error).message}`);
                setAlertType("error");
                setAlertAutoCloseMs(null);
                setAlertOpen(true);
              }
            }}
          >
            บันทึก
          </button>
        </div>
      </div>
      {/* Alert modal host */}
      <_AlertModalHost
        open={alertOpen}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        autoCloseMs={alertAutoCloseMs}
        onClose={() => setAlertOpen(false)}
      />
    </main>
  );
}

// render AlertModal via portal at end of file (keeps page component focused)
function _AlertModalHost({
  open,
  title,
  message,
  type,
  autoCloseMs,
  onClose,
}: {
  open: boolean;
  title?: string;
  message: string;
  type: "success" | "error" | "info" | "warning" | "delete";
  autoCloseMs: number | null;
  onClose: () => void;
}) {
  return (
    <AlertModal
      open={open}
      title={title}
      message={message}
      type={type}
      autoCloseMs={autoCloseMs}
      onClose={onClose}
    />
  );
}

// Table component for displaying data
function DataTable({
  headers,
  data,
  sectionKey,
  onDelete,
}: {
  headers: string[];
  data: string[][];
  sectionKey: string;
  onDelete: (id: string) => void;
}) {
  const isLoading = !data || data.length === 0;
  return (
    <div className="overflow-x-auto mb-8">
      <table className="min-w-full border border-gray-300 dark:border-gray-700 rounded-lg">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {headers.map((h: string, i: number) => (
              <th
                key={i}
                className="px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-200 border-b border-gray-300 dark:border-gray-700"
              >
                {h}
              </th>
            ))}
            <th className="px-4 py-2 text-left font-bold text-red-700 dark:text-red-300 border-b border-gray-300 dark:border-gray-700">
              ลบ
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(headers.length + 1)].map((_, j) => (
                    <td key={j} className="px-4 py-2">
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            : data.map((row: string[], i: number) => (
                <tr key={i} className="bg-white dark:bg-gray-900">
                  {row.map((cell: string, j: number) => (
                    <td
                      key={j}
                      className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100"
                    >
                      {cell}
                    </td>
                  ))}
                  <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                    <button
                      className="cursor-pointer px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => onDelete(row[0])}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
        {label}
      </label>
      <input
        type="text"
        className="rounded-lg border border-red-300 dark:border-red-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
