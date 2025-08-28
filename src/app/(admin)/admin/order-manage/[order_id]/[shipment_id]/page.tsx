"use client";
import React, { useEffect, useState } from "react";
import ApiService, { ShipmentDetailResponse } from "@/utils/ApiService";
import { useParams, useRouter } from "next/navigation";
import AlertModal from "@/component/AlertModal";

export default function ShipmentDetailPage() {
  const params = useParams();
  // Defensive fallback for params
  const shipment_id =
    params && params.shipment_id ? String(params.shipment_id) : "";
  // Use a client component for fetching and rendering
  return <ShipmentDetailClient shipment_id={shipment_id} />;
}

function ShipmentDetailClient({ shipment_id }: { shipment_id: string }) {
  const router = useRouter();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tracking, setTracking] = React.useState<any>(null);
  const [trackingLoading, setTrackingLoading] = React.useState(false);
  const [trackingError, setTrackingError] = React.useState<string | null>(null);

  // Alert modal state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState<string | undefined>(undefined);
  const [alertType, setAlertType] = useState<
    "success" | "error" | "info" | "warning" | "delete"
  >("info");
  const [alertAutoCloseMs, setAlertAutoCloseMs] = useState<number | null>(4000);

  function showAlert(
    message: string,
    type: "success" | "error" | "info" | "warning" | "delete" = "info",
    title?: string,
    autoCloseMs: number | null = 4000
  ) {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertAutoCloseMs(autoCloseMs);
    setAlertOpen(true);
  }

  const handlePrintLabel = async (purchase_id: string) => {
    let payload: import("@/utils/ApiService").LabelShipmentPayload;
    let result: any;

    payload = {
      api_key: String(process.env.NEXT_PUBLIC_SHIPPOP_API_KEY || ""),
      purchase_id,
      size: "letter",
      type: "html",
      logo: process.env.NEXT_PUBLIC_COMPANY_LOGO || "",
    };
    console.log("Payload for single label:", payload);
    result = await ApiService.labelShipment(payload);

    if (result.status) {
      if (result.url) {
        window.open(result.url, "_blank");
      } else if (result.html) {
        const printWindow = window.open("", "_blank");
        printWindow?.document.write(result.html);
        printWindow?.document.close();
        printWindow?.focus();
        setTimeout(() => {
          printWindow?.print();
        }, 1000);
      }
    } else {
      showAlert(
        result.message || "ไม่สามารถพิมพ์ label ได้",
        "error",
        "ข้อผิดพลาด",
        null
      );
    }
  };

  React.useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res: ShipmentDetailResponse = await ApiService.getShipmentDetail(
          Number(shipment_id)
        );
        if (res.success && res.data) {
          setData(res.data);
          // Fetch tracking info if tracking_no exists
          if (res.data && res.data.shipment.tracking_no) {
            setTrackingLoading(true);
            try {
              const trackRes = await ApiService.trackShipment(
                res.data.shipment.tracking_no
              );

              if (trackRes.status) {
                setTracking(trackRes);
              } else {
                setTrackingError(trackRes.message || "ไม่พบข้อมูลติดตาม");
              }
            } catch (err: any) {
              setTrackingError(err.message || "เกิดข้อผิดพลาดในการติดตาม");
            }
            setTrackingLoading(false);
          }
        } else {
          setError(res.message || "ไม่พบข้อมูลการจัดส่ง");
        }
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาด");
      }
      setLoading(false);
    };
    fetchDetail();
  }, [shipment_id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto bg-gradient-to-br from-white via-yellow-50 to-gray-100 dark:from-gray-900 dark:via-yellow-900 dark:to-gray-800 rounded-3xl shadow-2xl p-10 mt-20 mb-20 flex flex-col gap-8 animate-pulse">
        {/* Skeleton Header */}
        <div className="h-10 w-2/3 bg-yellow-100 dark:bg-yellow-900 rounded-xl mb-8" />
        {/* Skeleton Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 mb-6 border border-yellow-100 dark:border-yellow-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-2"
              />
            ))}
          </div>
        </div>
        {/* Skeleton Package */}
        <div className="bg-gradient-to-br from-yellow-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 mb-6 border border-yellow-200 dark:border-yellow-900">
          <div className="h-8 w-1/2 bg-yellow-100 dark:bg-yellow-900 rounded mb-6" />
          <div className="flex flex-col gap-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="mb-6 p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-lg border border-yellow-100 dark:border-yellow-900"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  {[...Array(6)].map((_, j) => (
                    <div
                      key={j}
                      className="h-5 w-2/3 bg-gray-200 dark:bg-gray-800 rounded mb-2"
                    />
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  {[...Array(3)].map((_, k) => (
                    <div
                      key={k}
                      className="h-8 w-24 bg-yellow-100 dark:bg-yellow-900 rounded-xl"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Skeleton Events */}
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-900">
          <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-800 rounded mb-6" />
          <div className="flex flex-col gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-full bg-yellow-50 dark:bg-yellow-900/30 rounded-2xl shadow-lg"
              />
            ))}
          </div>
        </div>
        {/* Skeleton Button */}
        <div className="flex justify-end mt-8">
          <div className="h-12 w-40 bg-red-200 dark:bg-red-900 rounded-full" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-10 mt-20 mb-20 flex flex-col items-center justify-center animate-fade-in">
        <svg
          className="w-12 h-12 text-red-500 animate-bounce mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
        <span className="text-red-600 text-2xl font-extrabold tracking-wide">
          {error}
        </span>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="max-w-2xl mx-auto p-10 mt-20 mb-20 flex flex-col items-center justify-center animate-fade-in">
        <svg
          className="w-12 h-12 text-gray-400 animate-bounce mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
        <span className="text-gray-600 text-2xl font-extrabold tracking-wide">
          ไม่พบข้อมูลการจัดส่ง
        </span>
      </div>
    );
  }

  return (
    <div className=" min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black p-6">
      <div className="w-full max-w-5xl mx-auto relative mt-30">
        {/* Modal-like card */}
        <div className="bg-white dark:bg-[#071022] rounded-3xl shadow-2xl p-6 border border-gray-100 dark:border-gray-800">
          <header className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                รายละเอียดการจัดส่ง
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                รายละเอียดการจัดส่งและสถานะพัสดุ
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.back()}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
              >
                ย้อนกลับ
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: summary + packages (span 2) */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white dark:bg-[#071022] rounded-lg shadow p-6 dark:shadow-xl dark:border dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    Shipment ID
                  </div>
                  <div className="font-mono text-gray-800 dark:text-gray-100">
                    {data.shipment.shipment_id}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    Order ID
                  </div>
                  <div className="text-gray-800 dark:text-gray-100">
                    {data.shipment.order_id}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    Provider
                  </div>
                  <div className="text-gray-800 dark:text-gray-100">
                    {data.shipment.provider_name} ({data.shipment.provider_code}
                    )
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    Status
                  </div>
                  <div>
                    <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm dark:bg-gray-700 dark:text-gray-100">
                      {data.shipment.shipping_status}
                    </span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    Tracking No
                  </div>
                  <div className="font-mono text-gray-800 dark:text-gray-100">
                    {data.shipment.tracking_no || "-"}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    External Tracking No
                  </div>
                  <div className="font-mono text-gray-800 dark:text-gray-100">
                    {data.shipment.external_shipment_code || "-"}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    Cost / COD
                  </div>
                  <div className="text-gray-800 dark:text-gray-100">
                    {Number(data.shipment.cost).toLocaleString()} ฿ /{" "}
                    {Number(data.shipment.cod_amount).toLocaleString()} ฿
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    Pickup Type
                  </div>
                  <div className="text-gray-800 dark:text-gray-100">
                    {data.shipment.pickup_type}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                  Packages
                </h2>
                {data.packages.map((pkg: ShipmentPackage) => (
                  <div
                    key={pkg.package_id}
                    className="border rounded p-4 bg-white dark:bg-[#071022] shadow-sm dark:border-gray-700"
                  >
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-gray-600 dark:text-gray-300">
                        Package ID
                      </div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">
                        {pkg.package_id}
                      </div>
                      <div className="text-gray-600 dark:text-gray-300">
                        Weight
                      </div>
                      <div className="text-gray-800 dark:text-gray-100">
                        {pkg.weight_kg} kg
                      </div>
                      <div className="text-gray-600 dark:text-gray-300">
                        Size (W×L×H)
                      </div>
                      <div className="text-gray-800 dark:text-gray-100">
                        {pkg.width_cm}×{pkg.length_cm}×{pkg.height_cm} cm
                      </div>
                      <div className="text-gray-600 dark:text-gray-300">
                        Volumetric
                      </div>
                      <div className="text-gray-800 dark:text-gray-100">
                        {pkg.volumetric_weight_kg} kg
                      </div>
                      <div className="text-gray-800 dark:text-gray-100">
                        {pkg.tracking_no || "-"}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Items
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {pkg.items.map((item: ShipmentPackageItem) => (
                          <li
                            key={item.order_item_id}
                            className="flex items-center justify-between bg-gray-50 dark:bg-[#071022] border rounded px-3 py-2 text-sm dark:border-gray-700"
                          >
                            <div className="font-mono">
                              {item.item_code || item.order_item_id}
                            </div>
                            <div className="text-gray-700 dark:text-gray-300">
                              x{item.qty}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: courier, tracking, events, actions */}
            <aside className="md:col-span-1 space-y-4">
              {data.courier_pickup && (
                <div className="border rounded p-4 bg-white dark:bg-[#071022] shadow-sm dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    Courier Pickup
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Pickup ID:{" "}
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {data.courier_pickup.pickup_id}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Ticket ID:{" "}
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {data.courier_pickup.courier_ticket_id}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Staff:{" "}
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {data.courier_pickup.staff_name || "-"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Status:{" "}
                    <span className="inline-block px-2 py-1 bg-gray-100 rounded text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                      {data.courier_pickup.status}
                    </span>
                  </div>
                </div>
              )}

              {trackingLoading ? (
                <div className="border rounded p-4 bg-white dark:bg-[#071022] text-center dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-200">
                    Loading tracking...
                  </span>
                </div>
              ) : trackingError ? (
                <div className="border rounded p-4 bg-white dark:bg-[#071022] text-center text-red-600 dark:text-red-400 dark:border-gray-700">
                  {trackingError}
                </div>
              ) : tracking ? (
                <div className="border rounded p-4 bg-white dark:bg-[#071022] shadow-sm dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    Tracking
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Code:{" "}
                    <span className="font-mono text-gray-800 dark:text-gray-100">
                      {tracking.tracking_code}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Status:{" "}
                    <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-100">
                      {tracking.order_status}
                    </span>
                  </div>
                  <div className="mt-3 text-sm">
                    <div className="font-medium text-gray-700 dark:text-gray-200">
                      Steps
                    </div>
                    <ol className="mt-2 list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {tracking.states?.map((step: any, idx: number) => (
                        <li key={idx} className="flex justify-between">
                          <div>
                            <span className="text-gray-700 dark:text-gray-100">
                              {step.status}
                            </span>{" "}
                            -{" "}
                            <span className="text-gray-600 dark:text-gray-300">
                              {step.description}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {step.datetime}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : null}

              <div className="border rounded p-4 bg-white dark:bg-[#071022] shadow-sm dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Events
                </h3>
                <ol className="space-y-3">
                  {data.events.slice(0, 5).map((ev: ShipmentEvent) => {
                    const code = (ev.event_code || "").toLowerCase();
                    let dotClass = "bg-gray-300 dark:bg-gray-500";
                    if (code.includes("cancel")) dotClass = "bg-red-600";
                    else if (code.includes("confirm"))
                      dotClass = "bg-emerald-500";
                    else if (
                      code.includes("create") ||
                      code.includes("created")
                    )
                      dotClass = "bg-yellow-500";
                    return (
                      <li key={ev.event_id} className="flex items-start gap-3">
                        <span
                          className={`flex-shrink-0 h-3 w-3 rounded-full mt-1 ${dotClass}`}
                        ></span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-800 dark:text-gray-100">
                              {ev.event_code}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(ev.event_time).toLocaleString()}
                            </div>
                          </div>
                          {ev.event_message && (
                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {ev.event_message}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
                {data.events.length > 5 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {data.events.length} total events
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  className="w-full text-center inline-block px-4 py-2 border rounded text-sm"
                  onClick={() => handlePrintLabel(data.shipment.purchase_id)}
                >
                  View Label
                </button>
              </div>
            </aside>
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
      </div>
    </div>
  );
}

// Type definitions for shipment data
// Add 'type' instead of 'interface' for compatibility in some setups

type ShipmentPackageItem = {
  package_id: number;
  order_item_id: number;
  qty: number;
  item_code: string | null;
};
type ShipmentPackage = {
  package_id: number;
  shipment_id: number;
  weight_kg: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  volumetric_weight_kg: number;
  tracking_no: string;
  label_url: string | null;
  items: ShipmentPackageItem[];
};
type ShipmentEvent = {
  event_id: number;
  shipment_id: number;
  event_code: string;
  event_message: string;
  event_time: string;
  created_at: string;
};
type ShipmentData = {
  shipment_id: number;
  order_id: number;
  provider_code: string;
  provider_name: string;
  shipping_status: string;
  merchant_ref: string;
  external_shipment_code: string;
  tracking_no: string;
  purchase_id: string;
  cost: number;
  cod_amount: number;
  pickup_type: string;
  pickup_date: string | null;
  label_url: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  packages: ShipmentPackage[];
  events: ShipmentEvent[];
};
