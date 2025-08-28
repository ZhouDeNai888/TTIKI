"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ApiService from "@/utils/ApiService";
import AlertModal from "@/component/AlertModal";
import dynamic from "next/dynamic";
// Dynamically load the Leaflet-based map component on the client only.
const WorldMapChartClient = dynamic(() => import("./WorldMapChartClient"), {
  ssr: false,
});

export default function OrderDetail({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  // State for selected items and shipping calculation trigger
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [shippingCalcTriggered, setShippingCalcTriggered] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [receiverLatLng, setReceiverLatLng] = useState<
    [number, number] | undefined
  >(undefined);
  const [shippingProviders, setShippingProviders] = useState<any[]>([]);
  const [shippingProvidersLoading, setShippingProvidersLoading] =
    useState(false);
  const [shippingProvidersError, setShippingProvidersError] = useState("");
  // Booking button state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  // Store last booking response for confirm
  const [lastBookingRes, setLastBookingRes] = useState<any>(null);
  // Shipments tab and selection state
  const [tabActive, setTabActive] = useState("all");
  const [selectedShipments, setSelectedShipments] = useState<number[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);

  // Alert state and helper
  const [alertState, setAlertState] = useState<{
    open: boolean;
    title?: string;
    message: string;
    type?: "success" | "error" | "info" | "warning" | "delete";
    autoCloseMs?: number | null;
  }>({ open: false, message: "", type: "info", autoCloseMs: null });

  const showAlert = (
    message: string,
    type: "success" | "error" | "info" | "warning" | "delete" = "info",
    title?: string,
    autoCloseMs: number | null = null
  ) => setAlertState({ open: true, title, message, type, autoCloseMs });

  // ...existing code...
  // Place this after all useState declarations for selectedShipments and shipments
  // Print label for selected shipments
  const handlePrintLabel = async () => {
    console.log("Selected shipments for label:", selectedShipments);
    if (selectedShipments.length === 0) return;
    let allTrackingCodes: string[] = [];
    let purchase_id = "";
    for (const id of selectedShipments) {
      const shipment = shipments.find((s: any) => s.shipment_id === id);
      console.log("Processing shipment:", shipment);
      if (!shipment) continue;
      if (shipment.tracking_no) {
        allTrackingCodes.push(shipment.tracking_no);
      }
      if (!purchase_id && shipment.purchase_id) {
        purchase_id = shipment.purchase_id;
      }
    }
    console.log("All tracking codes for label:", allTrackingCodes);
    if (allTrackingCodes.length === 0) return;
    let payload: import("@/utils/ApiService").LabelShipmentPayload;
    let result: any;
    if (allTrackingCodes.length === 1) {
      payload = {
        api_key: String(process.env.NEXT_PUBLIC_SHIPPOP_API_KEY || ""),
        purchase_id,
        size: "letter",
        type: "html",
        logo: process.env.NEXT_PUBLIC_COMPANY_LOGO || "",
      };
      console.log("Payload for single label:", payload);
      result = await ApiService.labelShipment(payload);
    } else {
      payload = {
        api_key: String(process.env.NEXT_PUBLIC_SHIPPOP_API_KEY || ""),
        tracking_code: allTrackingCodes.join(","),
        size: "letter4x6",
        type: "html",
        logo: process.env.NEXT_PUBLIC_COMPANY_LOGO || "",
      };
      console.log("Payload for multiple labels:", payload);
      result = await ApiService.labelTrackingCode(payload);
    }
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
      showAlert(result.message || "ไม่สามารถพิมพ์ label ได้", "error");
    }
  };

  // Batch confirm handler
  const handleBatchConfirm = async () => {
    setBatchLoading(true);
    setBookingError("");
    for (const shipmentId of selectedShipments) {
      try {
        const shipment = shipments.find(
          (s: any) => s.shipment_id === shipmentId
        );
        if (!shipment || shipment.shipping_status !== "booked") continue;
        const purchaseId = shipment.purchase_id;
        if (!purchaseId) continue;
        const confirmPayload = {
          api_key: String(process.env.NEXT_PUBLIC_SHIPPOP_API_KEY || ""),
          purchase_id: String(purchaseId),
        };
        const res = await fetch("/api/confirm/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(confirmPayload),
        });
        const data = await res.json();
        if (data.status) {
          const adminPayload = {
            order_id: Number(orderId),
            order_items_id: selectedItems,
            shipment_id: Number(shipment.shipment_id),
          };
          await ApiService.BookingConfirm(adminPayload);
        }
      } catch (err) {
        // ignore error for each
      }
    }
    // refresh
    try {
      const refreshed = await ApiService.getAdminOrderDetail(Number(orderId));
      if (refreshed.success && refreshed.data) {
        setOrder(refreshed.data.order);
        setItems(refreshed.data.items || []);
        setShippingAddress(refreshed.data.shipping_address || null);
        setPayment(refreshed.data.payment || null);
        setOrderDetail(refreshed.data);
      }
    } catch (err) {}
    setBatchLoading(false);
    setSelectedShipments([]);
  };
  const handleBooking = async () => {
    setBookingLoading(true);
    setBookingError("");
    setBookingSuccess(false);
    try {
      // Prepare booking payload
      if (
        !order ||
        !shippingAddress ||
        !selectedProvider ||
        selectedItems.length === 0
      ) {
        setBookingError("ข้อมูลไม่ครบถ้วน");
        setBookingLoading(false);
        return;
      }
      const filteredItems = items.filter((item: any) =>
        selectedItems.includes(item.order_item_id)
      );
      // Build BookingProduct objects and calculate parcel dimensions/weight
      const products: { [key: string]: any } = {};
      let totalWeight = 0,
        totalWidth = 0,
        totalLength = 0,
        totalHeight = 0;
      let maxWidth = 0;
      let maxLength = 0;
      let maxHeight = 0;
      let minIdx = 0;
      filteredItems.forEach((item: any, index: number) => {
        const qty = Number(
          itemQuantities[item.order_item_id] ??
            item.quantity ??
            item.amount ??
            1
        );
        // products ในรูปแบบที่ต้องการ
        products[index] = {
          product_code:
            item.item_code || item.code || item.order_item_id || `item${index}`,
          name: item.item_name || item.name || "",
          category: item.category || "-",
          detail: item.detail || "-",
          price: Number(item.price || 0),
          amount: qty,
          size: item.size || "-",
          color: item.color || "-",
          weight: Number(item.weight || 0),
        };
        const weight = Number(item.weight || 1);
        const width = Number(item.width || 10);
        const length = Number(item.length || 10);
        const height = Number(item.height || 10);
        const dims = [width, length, height];
        const minVal = Math.min(...dims);
        minIdx = dims.indexOf(minVal);
        // สร้างอาร์เรย์ขนาดใหม่ โดยคูณเฉพาะค่าที่น้อยสุด
        const newDims = dims.map((v, i) => (i === minIdx ? v * qty : v));
        totalWeight += weight * qty * 1000; // grams
        // สำหรับ Combined Parcel
        if (filteredItems.length > 1) {
          // รวมเฉพาะค่าที่น้อยสุด (คูณ qty)
          // ค่าที่เหลือใช้ค่ามากสุดของแต่ละด้าน
          if (index === 0) {
            // เริ่มต้น
            totalWidth = minIdx === 0 ? width * qty : width;
            totalLength = minIdx === 1 ? length * qty : length;
            totalHeight = minIdx === 2 ? height * qty : height;
            // เก็บค่ามากสุด
            maxWidth = width;
            maxLength = length;
            maxHeight = height;
          } else {
            // ค่าที่น้อยสุด (คูณ qty)
            if (minIdx === 0) totalWidth += width * qty;
            if (minIdx === 1) totalLength += length * qty;
            if (minIdx === 2) totalHeight += height * qty;
            // ค่ามากสุด
            maxWidth = Math.max(maxWidth, width);
            maxLength = Math.max(maxLength, length);
            maxHeight = Math.max(maxHeight, height);
          }
        } else {
          totalWidth += width;
          totalLength += length;
          totalHeight += height;
        }
      });
      if (filteredItems.length > 1) {
        if (minIdx === 0) {
          totalLength = maxLength;
          totalHeight = maxHeight;
        } else if (minIdx === 1) {
          totalWidth = maxWidth;
          totalHeight = maxHeight;
        } else if (minIdx === 2) {
          totalWidth = maxWidth;
          totalLength = maxLength;
        }
      }
      // Build booking data
      const bookingData = {
        products: products,
        from: {
          name: String(
            process.env.NEXT_PUBLIC_COMPANY_NAME || "Bangkok Sender"
          ),
          address: String(process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Bangkok"),
          district: String(process.env.NEXT_PUBLIC_COMPANY_DISTRICT || ""),
          state: String(process.env.NEXT_PUBLIC_COMPANY_STATE || ""),
          province: String(
            process.env.NEXT_PUBLIC_COMPANY_PROVINCE || "Bangkok"
          ),
          postcode: String(process.env.NEXT_PUBLIC_COMPANY_POSTCODE || "10110"),
          tel: String(process.env.NEXT_PUBLIC_COMPANY_PHONE || ""),
        },
        to: {
          name: `${shippingAddress.first_name || ""} ${
            shippingAddress.last_name || ""
          }`.trim(),
          address: String(shippingAddress.address_line1 || ""),
          district: String(shippingAddress.district || ""),
          state: String(shippingAddress.sub_district || ""),
          province: String(shippingAddress.province || ""),
          postcode: String(shippingAddress.postal_code || ""),
          tel: String(shippingAddress.phone_number || ""),
        },
        parcel: {
          name:
            filteredItems.length === 1
              ? String(filteredItems[0]?.item_name || "Parcel")
              : "Combined Parcel",
          weight: totalWeight,
          width: totalWidth,
          length: totalLength,
          height: totalHeight,
        },
        cod_amount: 0,
        courier_code: String(selectedProvider),
      };
      const payload = {
        api_key: String(process.env.NEXT_PUBLIC_SHIPPOP_API_KEY || ""),
        email: String(order?.user_email || "ttiki.sale02@gmail.com"),
        data: [bookingData],
      };
      // Step 1: Call createBooking
      const bookingRes = await ApiService.createBooking(payload);

      // Step 2: Call createBookingCreate (admin payload with all fields)
      if (bookingRes.status && bookingRes.purchase_id && bookingRes.data) {
        setBookingSuccess(true);
        setLastBookingRes(bookingRes);
        // Extract values from bookingRes.data["0"]
        const bookingData =
          bookingRes.data && bookingRes.data["0"] ? bookingRes.data["0"] : {};
        // Build packages array for BookingCreateRequest
        const packageItems = filteredItems.map((item: any) => ({
          order_item_id: item.order_item_id,
          qty:
            itemQuantities[item.order_item_id] ??
            item.quantity ??
            item.amount ??
            1,
        }));
        const packages = [
          {
            weight_kg: totalWeight / 1000, // convert to kg
            length_cm: totalLength,
            width_cm: totalWidth,
            height_cm: totalHeight,
            volumetric_weight_kg:
              (totalHeight * totalWidth * totalLength) / 5000, // volumetric weight in kg
            tracking_no: bookingData.tracking_code,
            label_url: bookingData.label_url,
            items: packageItems,
          },
        ];
        const bookingCreatePayload = {
          order_id: Number(orderId),
          order_items_id: selectedItems,
          provider_code: selectedProvider || bookingData.courier_code,
          shipping_status: bookingData.status ? "booked" : undefined,
          note: bookingData.note || undefined,
          tracking_code: bookingData.tracking_code,
          price: bookingData.price,
          cod_amount: bookingData.cod_amount,
          courier_tracking_code: bookingData.courier_tracking_code,
          purchase_id: bookingRes.purchase_id || undefined,
          packages,
        };
        const bookingCreateRes = await ApiService.createBookingCreate(
          bookingCreatePayload
        );
        if (!bookingCreateRes.success) {
          setBookingError(bookingCreateRes.message || "BookingCreate failed");
        }
        // Auto-refresh order detail after booking
        try {
          const res = await ApiService.getAdminOrderDetail(Number(orderId));
          if (res.success && res.data) {
            setOrder(res.data.order);
            setItems(res.data.items || []);
            setShippingAddress(res.data.shipping_address || null);
            setPayment(res.data.payment || null);
            setOrderDetail(res.data); // update shipments table
            setSelectedItems([]); // เคลียร์ checkbox หลังจอง
          }
        } catch (err) {
          // ignore fetch error
        }
      } else {
        setBookingError(bookingRes.message || "Booking failed");
      }
    } catch (err: any) {
      setBookingError(err?.message || "เกิดข้อผิดพลาด");
    }
    setBookingLoading(false);
  };

  const unwrappedParams = React.use(params);
  const orderId = unwrappedParams.order_id;

  const [shippingPrices, setShippingPrices] = useState<{
    [providerCode: string]: number | null;
  }>({});
  // Store conditions for each provider
  const [shippingConditions, setShippingConditions] = useState<{
    [providerCode: string]: string | null;
  }>({});

  // State for selected shipping provider (radio)
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {}
  );
  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await ApiService.getAdminOrderDetail(Number(orderId));
        if (res.success && res.data) {
          setOrder(res.data.order);
          setItems(res.data.items || []);
          setShippingAddress(res.data.shipping_address || null);
          setPayment(res.data.payment || null);
          setOrderDetail(res.data);
          // Initialize itemQuantities from fetched items
          const quantities: Record<string, number> = {};
          (res.data.items || []).forEach((item: any) => {
            quantities[item.order_item_id] = Number(
              item.quantity || item.amount || 1
            );
          });
          setItemQuantities(quantities);
        } else {
          setError(res.message || "Failed to fetch order detail");
        }
      } catch (err) {
        setError((err as Error).message);
      }
      setLoading(false);
    };
    fetchOrderDetail();
  }, [orderId]);

  // ดึงข้อมูล shipping providers
  useEffect(() => {
    const fetchProviders = async () => {
      setShippingProvidersLoading(true);
      setShippingProvidersError("");
      try {
        const res = await ApiService.getAllShippingProviders();
        if (res.success && res.data) {
          setShippingProviders(res.data);
        } else {
          setShippingProvidersError(res.message || "ไม่พบข้อมูลขนส่ง");
        }
      } catch (err) {
        setShippingProvidersError((err as Error).message);
      }
      setShippingProvidersLoading(false);
    };
    fetchProviders();
  }, []);

  // Geocode shipping address to lat/lng
  useEffect(() => {
    const geocodeAddress = async () => {
      if (!shippingAddress) return;
      const address = [
        shippingAddress.address_line1,
        shippingAddress.address_line2,
        shippingAddress.sub_district,
        shippingAddress.district,
        shippingAddress.province,
        shippingAddress.postal_code,
        shippingAddress.country,
      ]
        .filter(Boolean)
        .join(", ");
      try {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          address
        )}&key=${process.env.NEXT_PUBLIC_OPEN_CAGE_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (
          data &&
          data.results &&
          data.results[0] &&
          data.results[0].geometry
        ) {
          setReceiverLatLng([
            parseFloat(data.results[0].geometry.lat),
            parseFloat(data.results[0].geometry.lng),
          ]);
        }
      } catch (err) {
        // ไม่ต้องแจ้ง error
      }
    };
    geocodeAddress();
  }, [shippingAddress]);

  // Fetch shipping prices for all providers, combine items into one parcel
  useEffect(() => {
    if (!shippingCalcTriggered) return;
    const fetchPrices = async () => {
      if (
        !order ||
        !shippingAddress ||
        shippingProviders.length === 0 ||
        !receiverLatLng ||
        selectedItems.length === 0
      ) {
        setShippingCalcTriggered(false);
        return;
      }
      // Filter items to only selected
      const filteredItems = items.filter((item: any) =>
        selectedItems.includes(item.order_item_id)
      );
      // --- Refactored parcel calculation logic ---
      const grouped: Record<number, any[]> = {};
      filteredItems.forEach((item: any) => {
        if (!grouped[item.order_item_id]) grouped[item.order_item_id] = [];
        grouped[item.order_item_id].push(item);
      });

      let totalWeight = 0;
      let totalWidth = 0,
        totalLength = 0,
        totalHeight = 0;

      const numOr = (v: any, fb: number) => {
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? n : fb; // กันค่าผิด/ติดลบ/NaN
      };
      console.log(grouped);
      if (Object.keys(grouped).length === 1) {
        // --- Single item_id case ---
        const group = Object.values(grouped)[0];

        // qty รวมของ "ทั้งกลุ่ม"
        const qtyTotal = group.reduce(
          (sum, i) =>
            sum +
            (itemQuantities[i.order_item_id] ?? i.quantity ?? i.amount ?? 1),
          0
        );

        // ดึงมิติโดยใช้ ?? ไม่ใช่ ||
        const widths = group.map((i) => numOr(i.width ?? 10, 10));
        const lengths = group.map((i) => numOr(i.length ?? 10, 10));
        const heights = group.map((i) => numOr(i.height ?? 10, 10));
        const weights = group.map((i) => numOr(i.weight ?? 1, 1)); // kg

        // หา min ต่อแกนของกลุ่ม เพื่อเลือก "แกนเล็กสุด" เดียว
        const minW = Math.min(...widths);
        const minL = Math.min(...lengths);
        const minH = Math.min(...heights);
        const mins = [minW, minL, minH];
        const minVal = Math.min(...mins);
        const minIdx = mins.indexOf(minVal);

        // อีกสองแกน ใช้ "ค่ามากสุดในกลุ่ม" เพื่อกันหีบห่ออัดแน่นเกินจริง
        const maxW = Math.max(...widths);
        const maxL = Math.max(...lengths);
        const maxH = Math.max(...heights);

        // ตั้งค่ามิติรวม: แกนเล็กสุด * qtyTotal, อีกสองแกนใช้ max
        const dims: [number, number, number] = [maxW, maxL, maxH];
        dims[minIdx] = mins[minIdx] * qtyTotal;

        totalWidth = Math.ceil(dims[0]);
        totalLength = Math.ceil(dims[1]);
        totalHeight = Math.ceil(dims[2]);

        // น้ำหนักรวม (กรัม) — ชั่งตาม qty ของแต่ละแถว
        const weightKgSum = weights.reduce(
          (sum, w, idx) =>
            sum +
            w *
              (itemQuantities[group[idx].order_item_id] ??
                group[idx].quantity ??
                group[idx].amount ??
                1),
          0
        );
        totalWeight = Math.round(weightKgSum * 1000);
        console.log(
          `Single item dimensions: w=${dims[0]}, l=${dims[1]}, h=${dims[2]}, qty=${qtyTotal}`
        );
      } else {
        // --- Multiple item_id case (Combined Parcel) ---
        let minSumAllGroups = 0; // ผลบวก "มิติเล็กสุด * qty ของกลุ่ม"
        let maxW = 0,
          maxL = 0,
          maxH = 0; // max ของ "อีกสองแกน" ข้ามทุกกลุ่ม

        Object.values(grouped).forEach((group: any[]) => {
          const qty_g = group.reduce(
            (sum, i) =>
              sum +
              (itemQuantities[i.order_item_id] ?? i.quantity ?? i.amount ?? 1),
            0
          );

          const widths = group.map((i) => numOr(i.width ?? 10, 10));
          const lengths = group.map((i) => numOr(i.length ?? 10, 10));
          const heights = group.map((i) => numOr(i.height ?? 10, 10));
          const weights = group.map((i) => numOr(i.weight ?? 1, 1)); // kg

          // น้ำหนักรวมของกลุ่ม (กรัม)
          const weightKgSum = weights.reduce(
            (s, w, idx) =>
              s +
              w *
                (itemQuantities[group[idx].order_item_id] ??
                  group[idx].quantity ??
                  group[idx].amount ??
                  1),
            0
          );
          totalWeight += Math.round(weightKgSum * 1000);

          // ใช้ "min ต่อแกน" ภายในกลุ่ม เพื่อกัน outlier
          const w_g = Math.min(...widths);
          const l_g = Math.min(...lengths);
          const h_g = Math.min(...heights);

          console.log(
            `Group dimensions: w=${w_g}, l=${l_g}, h=${h_g}, qty=${qty_g}`
          );

          // แกนเล็กสุดของกลุ่ม
          const mins = [w_g, l_g, h_g];
          const minVal = Math.min(...mins);
          const minIdx = mins.indexOf(minVal);

          // รวมมิติเล็กสุด*qty ของกลุ่มนี้
          minSumAllGroups += minVal * qty_g;

          // อีกสองแกนเก็บค่า max ข้ามกลุ่ม (แกนเล็กสุดใส่ 0 เพื่อไม่ไปดัน max)
          const otherDims: [number, number, number] = [w_g, l_g, h_g];
          otherDims[minIdx] = 0;

          maxW = Math.max(maxW, otherDims[0]);
          maxL = Math.max(maxL, otherDims[1]);
          maxH = Math.max(maxH, otherDims[2]);
        });

        // เลือกแกนโฮสต์ = แกนที่ max เล็กสุด
        const maxima = [maxW, maxL, maxH];
        const host = maxima.indexOf(Math.min(...maxima));

        // ตั้งค่ามิติรวม
        const dims: [number, number, number] = [maxW, maxL, maxH];
        dims[host] = minSumAllGroups;

        totalWidth = Math.ceil(dims[0]);
        totalLength = Math.ceil(dims[1]);
        totalHeight = Math.ceil(dims[2]);
      }

      // Build data object for all providers, single parcel
      const dataObj: any = {};
      shippingProviders.forEach((sp: any, idx: number) => {
        dataObj[idx] = {
          from: {
            name: String(
              process.env.NEXT_PUBLIC_COMPANY_NAME || "Bangkok Sender"
            ),
            address: String(
              process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Bangkok"
            ),
            district: String(process.env.NEXT_PUBLIC_COMPANY_DISTRICT || ""),
            state: String(process.env.NEXT_PUBLIC_COMPANY_STATE || ""),
            province: String(
              process.env.NEXT_PUBLIC_COMPANY_PROVINCE || "Bangkok"
            ),
            postcode: String(
              process.env.NEXT_PUBLIC_COMPANY_POSTCODE || "10110"
            ),
            tel: String(process.env.NEXT_PUBLIC_COMPANY_PHONE || ""),
            lat: String(
              process.env.NEXT_PUBLIC_COMPANY_LATITUDE || "13.984328061681728"
            ),
            lng: String(
              process.env.NEXT_PUBLIC_COMPANY_LONGITUDE || "100.59595967748822"
            ),
          },
          to: {
            name: `${shippingAddress.first_name || ""} ${
              shippingAddress.last_name || ""
            }`.trim(),
            address: String(shippingAddress.address_line1 || ""),
            district: String(shippingAddress.district || ""),
            state: String(shippingAddress.sub_district || ""),
            province: String(shippingAddress.province || ""),
            postcode: String(shippingAddress.postal_code || ""),
            tel: String(shippingAddress.phone_number || ""),
            lat: String(receiverLatLng[0]),
            lng: String(receiverLatLng[1]),
          },
          parcel: {
            name:
              filteredItems.length === 1
                ? String(filteredItems[0]?.item_name || "Parcel")
                : "Combined Parcel",
            weight: totalWeight,
            width: totalWidth,
            length: totalLength,
            height: totalHeight,
          },
          courier_code: String(sp.provider_code),
          showall: 1,
        };
      });
      const payload = {
        api_key: String(process.env.NEXT_PUBLIC_SHIPPOP_API_KEY || ""),
        data: dataObj,
      };
      try {
        const res = await ApiService.getShippopPrice(payload);
        // Extract price and conditions for each provider
        const prices: { [providerCode: string]: number | null } = {};
        const conditions: { [providerCode: string]: string | null } = {};
        Object.entries(res.data || {}).forEach(([idx, couriers]: any) => {
          const sp = shippingProviders[idx];
          if (!sp) return;
          const courierObj = couriers[sp.provider_code];
          let price: number | null = null;
          let conditionText: string | null = null;
          if (courierObj) {
            if (typeof courierObj.price !== "undefined") {
              price = Number(courierObj.price);
            }
            if (
              Array.isArray(courierObj.conditions) &&
              courierObj.conditions.length > 0
            ) {
              conditionText = (courierObj.conditions as any[])
                .map((c) => (c && c.additional_fee ? c.additional_fee : null))
                .filter(Boolean)
                .join("; ");
            }
          }
          prices[sp.provider_code] = price;
          conditions[sp.provider_code] = conditionText;
        });
        setShippingPrices(prices);
        setShippingConditions(conditions);
      } catch (err) {
        // fallback: set all to null
        const prices: { [providerCode: string]: number | null } = {};
        const conditions: { [providerCode: string]: string | null } = {};
        shippingProviders.forEach((sp: any) => {
          prices[sp.provider_code] = null;
          conditions[sp.provider_code] = null;
        });
        setShippingPrices(prices);
        setShippingConditions(conditions);
      }
      setShippingCalcTriggered(false);
    };
    fetchPrices();
  }, [
    shippingCalcTriggered,
    order,
    shippingAddress,
    receiverLatLng,
    shippingProviders,
    items,
    selectedItems,
  ]);

  // Extract shipments from orderDetail (the full response from getAdminOrderDetail)
  // You likely have: const [orderDetail, setOrderDetail] = useState<any>(null);
  // When fetching: setOrderDetail(res.data)
  // Use shipments from orderDetail
  const shipments =
    orderDetail && Array.isArray(orderDetail.shipments)
      ? orderDetail.shipments
      : [];

  // Show Shipments table immediately after booking
  const showShipments = Array.isArray(shipments) && shipments.length > 0;
  // ...existing code...
  // If order is cancelled, allow viewing all data but disable all controls
  const isCancelled = order?.status === "cancelled";
  const isPaymentUnpaid =
    (payment?.payment_status || "").toString().toLowerCase() === "unpaid";
  if (loading) {
    return (
      <div className="w-full max-w-8xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-10 mt-20 mb-20 flex flex-col gap-8 animate-pulse">
        {/* Skeleton for WorldMapChartClient */}
        <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg mb-8 bg-gray-200 dark:bg-gray-800" />
        {/* Skeleton for Order Info and Shipping Address */}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 bg-gradient-to-br from-red-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-base">
              {[...Array(8)].map((_, i) => (
                <React.Fragment key={i}>
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-base">
              {[...Array(8)].map((_, i) => (
                <React.Fragment key={i}>
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        {/* Skeleton for Payment Card */}
        <div className="bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-base">
            {[...Array(4)].map((_, i) => (
              <React.Fragment key={i}>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </React.Fragment>
            ))}
          </div>
        </div>
        {/* Skeleton for Order Items Table */}
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse mb-2">
              <thead>
                <tr className="bg-red-100 dark:bg-gray-800">
                  {[...Array(6)].map((_, i) => (
                    <th key={i} className="py-2 px-4">
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(3)].map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-red-100 dark:border-gray-700"
                  >
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="py-2 px-4">
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Skeleton for Shipping Providers Table */}
        <div className="bg-gradient-to-br from-yellow-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 mb-8">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse mb-2">
              <thead>
                <tr className="bg-yellow-100 dark:bg-gray-800">
                  {[...Array(5)].map((_, i) => (
                    <th key={i} className="py-2 px-4">
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(3)].map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-yellow-100 dark:border-gray-700"
                  >
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="py-2 px-4">
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Skeleton for buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-end items-center mt-4">
          <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="w-full max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 mt-30 mb-30 text-center">
        <h2 className="text-2xl font-extrabold text-red-700 dark:text-red-300 mb-6">
          Order Not Found
        </h2>
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <button
          className="px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 mt-4"
          onClick={() => router.back()}
        >
          Back
        </button>
      </div>
    );
  }

  // sender: Bangkok, Thailand
  const senderPosition: [number, number] = [
    13.984328061681728, 100.59595967748822,
  ];
  // console.log("Sender Position:", senderPosition);
  // console.log("Receiver Position:", receiverLatLng);
  // Handler stubs for shipment actions
  const handleDeleteShipment = async (shipmentId: number) => {
    if (!shipmentId) return;
    const res = await ApiService.deleteShipment(shipmentId);
    if (res.success) {
      // Refresh all order states after deletion
      if (orderId) {
        const detailRes = await ApiService.getAdminOrderDetail(Number(orderId));
        if (detailRes.success && detailRes.data) {
          setOrder(detailRes.data.order);
          setItems(detailRes.data.items || []);
          setShippingAddress(detailRes.data.shipping_address || null);
          setPayment(detailRes.data.payment || null);
          setOrderDetail(detailRes.data);
        }
      }
    } else {
      showAlert(res.message || "ลบ shipment ไม่สำเร็จ", "error", "ข้อผิดพลาด");
    }
  };

  const handleCancelShipment = async (shipmentId: number) => {
    if (!shipmentId) return;
    // Find shipment by id
    const shipment = shipments.find((s: any) => s.shipment_id === shipmentId);
    console.log("Canceling shipment:", shipment);
    if (!shipment || !shipment.external_shipment_code) {
      showAlert(
        "ไม่พบข้อมูล courier_tracking_code สำหรับ shipment นี้",
        "error",
        "ข้อผิดพลาด"
      );
      return;
    }
    const payload = {
      api_key: String(process.env.NEXT_PUBLIC_SHIPPOP_API_KEY || ""),
      courier_tracking_code: shipment.external_shipment_code,
    };
    const res = await ApiService.cancelShipment(payload);
    if ((res as any).status) {
      // Also cancel in local system
      await ApiService.cancelAdminShipmentByExternalCode(
        shipment.external_shipment_code
      );
      // Refresh all order states after cancellation
      if (orderId) {
        const detailRes = await ApiService.getAdminOrderDetail(Number(orderId));
        if (detailRes.success && detailRes.data) {
          setOrder(detailRes.data.order);
          setItems(detailRes.data.items || []);
          setShippingAddress(detailRes.data.shipping_address || null);
          setPayment(detailRes.data.payment || null);
          setOrderDetail(detailRes.data);
        }
      }
    } else {
      showAlert(
        res.message || "ยกเลิก shipment ไม่สำเร็จ",
        "error",
        "ข้อผิดพลาด"
      );
    }
  };

  return (
    <div className="w-full max-w-8xl mx-auto bg-gradient-to-br from-white via-yellow-50 to-gray-100 dark:from-gray-900 dark:via-yellow-900 dark:to-gray-800  shadow-2xl p-10 mt-20  flex flex-col gap-8">
      {/* World Map Chart: เส้นทางจากผู้ส่งถึงผู้รับ */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-yellow-700 dark:text-yellow-300 mb-6 flex items-center gap-3 animate-fade-in">
          {/* Order Info: Clipboard List icon */}
          <svg
            className="w-8 h-8 text-yellow-500 animate-spin"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5h6a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2zm0 0V3a2 2 0 012-2h2a2 2 0 012 2v2"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17h6" />
          </svg>
          ข้อมูลคำสั่งซื้อ
        </h1>
        <WorldMapChartClient
          senderPosition={senderPosition}
          receiverPosition={receiverLatLng}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Order Info Card */}
        <div className="flex-1 bg-gradient-to-br from-red-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 animate-fade-in">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4 flex items-center gap-2">
            {/* Order Info: Document icon */}
            <svg
              className="w-6 h-6 text-red-400 animate-bounce"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 4h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16h10" />
            </svg>
            Order Info
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-base">
            <div className="font-semibold text-gray-700 dark:text-gray-200">
              Order ID:
            </div>
            <div className="font-mono text-lg text-yellow-700 dark:text-yellow-300">
              {order.order_id}
            </div>
            <div className="font-semibold text-gray-700 dark:text-gray-200">
              User ID:
            </div>
            <div>{order.user_id}</div>

            <div className="font-semibold text-gray-700 dark:text-gray-200">
              Status:
            </div>
            <div>
              <span
                className={
                  order.status?.toLowerCase() === "pending"
                    ? "text-yellow-600 font-bold animate-pulse"
                    : order.status?.toLowerCase() === "shipped"
                    ? "text-blue-600 font-bold animate-pulse"
                    : "text-green-600 font-bold animate-pulse"
                }
              >
                {order.status
                  ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                  : "-"}
              </span>
            </div>
            <div className="font-semibold text-gray-700 dark:text-gray-200">
              Note:
            </div>
            <div>{order.note || "-"}</div>
            <div className="font-semibold text-gray-700 dark:text-gray-200">
              Created At:
            </div>
            <div>{order.created_at}</div>
            <div className="font-semibold text-gray-700 dark:text-gray-200">
              Updated At:
            </div>
            <div>{order.updated_at}</div>
          </div>
        </div>
        {/* Shipping Address Card */}
        {shippingAddress && (
          <div className="flex-1 bg-gradient-to-br from-blue-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
              {/* Shipping Address: Location Pin icon */}
              <svg
                className="w-6 h-6 text-blue-400 animate-bounce"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21c-4.418 0-8-4.03-8-9a8 8 0 1116 0c0 4.97-3.582 9-8 9zm0-13a3 3 0 100 6 3 3 0 000-6z"
                />
              </svg>
              Shipping Address
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-base">
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                Name:
              </div>
              <div>
                {shippingAddress.first_name} {shippingAddress.last_name}
              </div>
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                Phone:
              </div>
              <div>{shippingAddress.phone_number}</div>
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                Address 1:
              </div>
              <div>{shippingAddress.address_line1}</div>
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                Address 2:
              </div>
              <div>{shippingAddress.address_line2}</div>
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                Sub-district:
              </div>
              <div>{shippingAddress.sub_district}</div>
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                District:
              </div>
              <div>{shippingAddress.district}</div>
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                Province:
              </div>
              <div>{shippingAddress.province}</div>
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                Postal Code:
              </div>
              <div>{shippingAddress.postal_code}</div>
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                Country:
              </div>
              <div>{shippingAddress.country}</div>
            </div>
          </div>
        )}
      </div>
      {/* Payment Card */}
      {payment && (
        <div className="bg-gradient-to-br from-green-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 animate-fade-in">
          <h2 className="text-xl font-bold text-green-700 dark:text-green-300 mb-4 flex items-center gap-2">
            {/* Payment: Credit Card icon */}
            <svg
              className="w-6 h-6 text-green-400 animate-bounce"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="2" y="7" width="20" height="10" rx="2" ry="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 11h20" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 15h.01"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 15h2" />
            </svg>
            Payment
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-base">
            <div className="font-semibold text-gray-700 dark:text-gray-200">
              Amount:
            </div>
            <div className="text-green-700 dark:text-green-300 font-bold text-lg">
              {Number(payment.amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="font-semibold text-gray-700 dark:text-gray-200">
              Method:
            </div>
            <div>{payment.payment_method}</div>
            <div className="font-semibold text-gray-700 dark:text-gray-200">
              Payment Status:
            </div>
            <div>{payment.payment_status || "-"}</div>
          </div>
        </div>
      )}

      {/* Order Items Card */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
          {/* Order Items: Box icon */}
          <svg
            className="w-6 h-6 text-gray-400 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="7" width="18" height="13" rx="2" ry="2" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7l9 6 9-6"
            />
          </svg>
          <span>Order Items</span>
          {showShipments && (
            <AlertModal
              open={alertState.open}
              title={alertState.title}
              message={alertState.message}
              type={alertState.type}
              autoCloseMs={alertState.autoCloseMs}
              onClose={() => setAlertState({ ...alertState, open: false })}
            />
          )}

          <span className="text-xs bg-yellow-100 text-yellow-700 rounded px-2 py-1 font-semibold">
            เลือกสินค้าที่ต้องการคำนวณค่าขนส่ง
          </span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate mb-2 rounded-xl shadow-md overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-red-100 to-yellow-100 dark:from-gray-800 dark:to-yellow-900">
                <th className="py-2 px-4 rounded-tl-xl">
                  <input
                    type="checkbox"
                    className={`accent-yellow-500 scale-125 ${
                      isCancelled
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    } transition-all duration-200 ${
                      isCancelled ? "" : "hover:accent-yellow-600"
                    }`}
                    checked={
                      selectedItems.length ===
                        items.filter((item) => item.status !== "booked")
                          .length &&
                      items.filter((item) => item.status !== "booked").length >
                        0
                    }
                    onChange={
                      isCancelled
                        ? undefined
                        : (e) => {
                            if (e.target.checked) {
                              setSelectedItems(
                                items
                                  .filter((item) => item.status !== "booked")
                                  .map((item) => item.order_item_id)
                              );
                            } else {
                              setSelectedItems([]);
                            }
                          }
                    }
                    disabled={
                      items.every((item) => item.status === "booked") ||
                      isCancelled
                    }
                  />
                </th>
                {items.length > 0 &&
                  Object.keys(items[0]).map((key, i) => (
                    <th
                      key={key}
                      className={
                        "py-2 px-4 " +
                        (i === Object.keys(items[0]).length - 1
                          ? "rounded-tr-xl"
                          : "")
                      }
                    >
                      {key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={items[0] ? Object.keys(items[0]).length + 1 : 1}
                    className="py-4 text-center text-gray-500"
                  >
                    No items found for this order.
                  </td>
                </tr>
              ) : (
                items.map((item: any, idx: number) => {
                  const isSelected = selectedItems.includes(item.order_item_id);
                  return (
                    <tr
                      key={idx}
                      className={`border-b border-red-100 dark:border-gray-700 transition-all duration-150 ${
                        isSelected
                          ? "bg-yellow-50 dark:bg-yellow-900/40"
                          : "hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                      }`}
                    >
                      <td className="py-2 px-4">
                        <input
                          type="checkbox"
                          className={`accent-yellow-500 scale-110 ${
                            isCancelled
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer"
                          } transition-all duration-200 ${
                            isCancelled ? "" : "hover:accent-yellow-600"
                          }`}
                          checked={isSelected}
                          disabled={item.status === "booked" || isCancelled}
                          onChange={
                            isCancelled
                              ? undefined
                              : (e) => {
                                  if (e.target.checked) {
                                    setSelectedItems((prev: number[]) => [
                                      ...prev,
                                      item.order_item_id,
                                    ]);
                                  } else {
                                    setSelectedItems((prev: number[]) =>
                                      prev.filter(
                                        (id: number) =>
                                          id !== item.order_item_id
                                      )
                                    );
                                  }
                                }
                          }
                        />
                      </td>
                      {Object.entries(item).map(([key, val], i) => {
                        if (key === "quantity" || key === "amount") {
                          // Prefer server-provided real quantity when available
                          const maxQty = Number(val ?? 1);
                          const serverQty = Number(
                            item.real_quantity ?? val ?? 1
                          );
                          return (
                            <td key={i} className="py-2 px-4">
                              <div className="flex flex-col">
                                <input
                                  type="number"
                                  min={1}
                                  max={maxQty}
                                  className={`w-20 px-2 py-1 rounded border border-yellow-400 ${
                                    isCancelled
                                      ? "bg-gray-100 cursor-not-allowed opacity-60"
                                      : "focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                  }`}
                                  value={
                                    itemQuantities[item.order_item_id] ??
                                    val ??
                                    1
                                  }
                                  onChange={
                                    isCancelled
                                      ? undefined
                                      : (e) => {
                                          let newQty = Number(e.target.value);
                                          if (newQty < 1) newQty = 1;
                                          if (newQty > maxQty) newQty = maxQty;
                                          setItemQuantities((q) => ({
                                            ...q,
                                            [item.order_item_id]: newQty,
                                          }));
                                        }
                                  }
                                  disabled={
                                    item.status === "booked" || isCancelled
                                  }
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  จำนวนทั้งหมด:{" "}
                                  <span className="font-semibold">
                                    {serverQty}
                                  </span>
                                </div>
                              </div>
                            </td>
                          );
                        }
                        return (
                          <td key={i} className="py-2 px-4">
                            {key === "order_item_id"
                              ? String(val)
                              : typeof val === "number"
                              ? val.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : val !== null && val !== undefined
                              ? String(val)
                              : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Selected items summary and animated button */}
        <div className="flex flex-col md:flex-row gap-4 justify-end items-center mt-4">
          <div className="flex-1 text-right">
            {selectedItems.length > 0 && (
              <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg font-semibold shadow-sm animate-pulse">
                เลือก {selectedItems.length} ชิ้น
              </span>
            )}
          </div>
          <button
            className={`px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold shadow-lg transition-all duration-200 flex items-center gap-2 ${
              isCancelled
                ? "opacity-60 cursor-not-allowed"
                : "hover:from-yellow-600 hover:to-yellow-700"
            }`}
            disabled={isCancelled || selectedItems.length === 0}
            onClick={
              isCancelled ? undefined : () => setShippingCalcTriggered(true)
            }
          >
            <svg
              className="w-5 h-5 animate-bounce"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7"
              />
            </svg>
            <span>คำนวณค่าขนส่ง</span>
          </button>
        </div>
      </div>
      {/* Shipping Providers Compare Table */}
      <div className="bg-gradient-to-br from-yellow-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-yellow-700 dark:text-yellow-300 mb-4 flex items-center gap-2 animate-fade-in">
          {/* Shipping Providers: Truck icon */}
          <svg
            className="w-6 h-6 text-yellow-400 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 8h3a2 2 0 012 2v5a2 2 0 01-2 2h-1"
            />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          Shipping Providers
        </h2>
        <div className="overflow-x-auto ">
          <table className="w-full text-left border-separate mb-2 rounded-xl shadow-md overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-yellow-100 to-yellow-300 dark:from-gray-800 dark:to-yellow-900">
                <th className="py-2 px-4 rounded-tl-xl">
                  <svg
                    className="w-5 h-5 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </th>
                <th className="py-2 px-4">Provider Name</th>
                <th className="py-2 px-4">Code</th>
                <th className="py-2 px-4">Description</th>
                <th className="py-2 px-4">Price</th>
                <th className="py-2 px-4 rounded-tr-xl">Condition</th>
              </tr>
            </thead>
            <tbody>
              {shippingProviders.map((sp: any, idx: number) => {
                const priceVal = shippingPrices[sp.provider_code];
                const conditionText = shippingConditions[sp.provider_code];
                const isSelected = selectedProvider === sp.provider_code;
                return (
                  <tr
                    key={sp.provider_code}
                    className={`border-b border-yellow-100 dark:border-gray-700 transition-all duration-150 ${
                      isSelected
                        ? "bg-yellow-200 dark:bg-yellow-900/40"
                        : "hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                    }`}
                  >
                    <td className="py-2 px-4">
                      <input
                        type="radio"
                        name="shippingProviderRadio"
                        checked={isSelected}
                        onChange={
                          isCancelled
                            ? undefined
                            : () => setSelectedProvider(sp.provider_code)
                        }
                        className={`accent-yellow-500 scale-110 ${
                          isCancelled
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer"
                        } transition-all duration-200 ${
                          isCancelled ? "" : "hover:accent-yellow-600"
                        }`}
                        disabled={isCancelled}
                      />
                    </td>
                    <td className="py-2 px-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 17v-2a4 4 0 014-4h6"
                        />
                      </svg>
                      <span className="font-semibold">{sp.provider_name}</span>
                    </td>
                    <td className="py-2 px-4 font-mono text-yellow-700 dark:text-yellow-300">
                      {sp.provider_code}
                    </td>
                    <td className="py-2 px-4">{sp.description || "-"}</td>
                    <td className="py-2 px-4 font-bold text-green-700 dark:text-green-300">
                      {priceVal !== undefined &&
                      priceVal !== null &&
                      Number(priceVal) !== 0 ? (
                        <span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded-lg shadow-sm">
                          {Number(priceVal).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      ) : (
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                          -
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-yellow-700 dark:text-yellow-300">
                      {conditionText || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex justify-end mt-4">
            <button
              className={`px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-lg transition-all duration-200 flex items-center gap-2 ${
                isCancelled
                  ? "opacity-60 cursor-not-allowed"
                  : isPaymentUnpaid
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:from-blue-600 hover:to-blue-700"
              }`}
              disabled={
                isCancelled ||
                bookingLoading ||
                !selectedProvider ||
                selectedItems.length === 0
              }
              onClick={
                isCancelled
                  ? undefined
                  : () => {
                      if (isPaymentUnpaid) {
                        showAlert("ยังไม่ได้ชำระเงิน", "warning", "Payment");
                        return;
                      }
                      handleBooking();
                    }
              }
            >
              <svg
                className="w-5 h-5 animate-bounce"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 17l-4-4m0 0l4-4m-4 4h12"
                />
              </svg>
              <span>{bookingLoading ? "กำลังจองขนส่ง..." : "จองขนส่ง"}</span>
            </button>
          </div>
        </div>
      </div>
      {/* Shipments Card */}
      {showShipments && (
        <div className="bg-gradient-to-br from-yellow-100 to-white dark:from-gray-800 dark:to-yellow-900 rounded-2xl shadow-xl p-6 animate-fade-in mt-8">
          {/* Tabbar and batch confirm */}
          <h1 className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mb-4 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-yellow-500 inline-block mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5h18M3 9h18M3 13h18m-7 4h7m-7 4h7"
              />
            </svg>
            Shipments
          </h1>
          <div className="flex items-center gap-4 mb-4">
            {/* Pick up action buttons for selected shipments */}

            {/* Determine which batch buttons to show based on selected shipments' statuses */}
            {(() => {
              // Get statuses of selected shipments
              const selectedStatuses = shipments
                .filter((s: any) => selectedShipments.includes(s.shipment_id))
                .map((s: any) => s.shipping_status);
              // If none selected, show all buttons disabled
              if (selectedShipments.length === 0) {
                return (
                  <>
                    {/* <button
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold shadow-lg transition-all duration-200 flex items-center gap-2 opacity-60 cursor-not-allowed"
                      disabled
                    >
                      ยืนยันที่เลือก
                    </button>
                    <button
                      className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold shadow-lg text-xs opacity-60 cursor-not-allowed"
                      disabled
                    >
                      ลบที่เลือก
                    </button>
                    <button
                      className="px-4 py-2 rounded-xl bg-gray-500 text-white font-bold shadow-lg text-xs opacity-60 cursor-not-allowed"
                      disabled
                    >
                      ยกเลิกที่เลือก
                    </button>
                    <button
                      className="px-4 py-2 rounded-xl bg-blue-500 text-white font-bold shadow-lg text-xs opacity-60 cursor-not-allowed"
                      disabled
                    >
                      พิมพ์ Label ที่เลือก
                    </button> */}
                    <h1>
                      กรุณาเลือก shipment ที่ต้องการดำเนินการ
                      <span className="text-red-500 font-bold"> *</span>
                    </h1>
                  </>
                );
              }
              // If all selected are booked
              if (selectedStatuses.every((st) => st === "booked")) {
                return (
                  <>
                    <button
                      className={`px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold shadow-lg transition-all duration-200 flex items-center gap-2 ${
                        batchLoading
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:from-green-600 hover:to-green-700"
                      }`}
                      disabled={batchLoading}
                      onClick={handleBatchConfirm}
                    >
                      {batchLoading ? "กำลังยืนยัน..." : "ยืนยันที่เลือก"}
                    </button>
                    <button
                      className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold shadow-lg text-xs hover:bg-red-600"
                      disabled={false}
                      onClick={() =>
                        selectedShipments.forEach((id) =>
                          handleDeleteShipment(id)
                        )
                      }
                    >
                      ลบที่เลือก
                    </button>
                  </>
                );
              }
              // If all selected are shipped
              if (selectedStatuses.every((st) => st === "confirmed")) {
                return (
                  <>
                    <button
                      className="px-4 py-2 rounded-xl bg-blue-500 text-white font-bold shadow-lg text-xs hover:bg-blue-600"
                      disabled={selectedShipments.length === 0}
                      onClick={async () => {
                        await handlePrintLabel();
                      }}
                    >
                      พิมพ์ Label ที่เลือก
                    </button>
                    <button
                      className="px-4 py-2 rounded-xl bg-purple-500 text-white font-bold shadow-lg text-xs hover:bg-purple-600"
                      disabled={selectedShipments.length === 0}
                      onClick={async () => {
                        for (const id of selectedShipments) {
                          const shipment = shipments.find(
                            (s: any) => s.shipment_id === id
                          );
                          if (!shipment) continue;
                          console.log(
                            shipment.external_shipment_code,
                            process.env.NEXT_PUBLIC_SHIPPOP_API_KEY
                          );
                          if (
                            !shipment.external_shipment_code ||
                            !process.env.NEXT_PUBLIC_SHIPPOP_API_KEY
                          ) {
                            showAlert(
                              "Missing tracking code or API key for shipment " +
                                id,
                              "error",
                              "ข้อผิดพลาด"
                            );
                            continue;
                          }
                          try {
                            const res = await ApiService.callToPickup({
                              api_key: process.env.NEXT_PUBLIC_SHIPPOP_API_KEY,
                              tracking_code: shipment.external_shipment_code,
                            });
                            const result = res as any;
                            if (result.status) {
                              // Save pickup info to backend
                              const pickupData = {
                                courier_ticket_id: String(
                                  result.courier_ticket_id
                                ),
                                courier_pickup_id: String(
                                  result.courier_pickup_id
                                ),
                                staff_name:
                                  result.data?.[0]?.pickupInfo?.staffName ||
                                  undefined,
                                staff_phone:
                                  result.data?.[0]?.pickupInfo?.staffPhone ||
                                  undefined,
                                order_id: shipment.order_id || undefined,
                                shipment_id: shipment.shipment_id || undefined,
                              };
                              await ApiService.addCourierPickup(pickupData);

                              // Refresh order detail after saving pickup info
                              if (orderId) {
                                const detailRes =
                                  await ApiService.getAdminOrderDetail(
                                    Number(orderId)
                                  );
                                if (detailRes.success && detailRes.data) {
                                  setOrder(detailRes.data.order);
                                  setItems(detailRes.data.items || []);
                                  setShippingAddress(
                                    detailRes.data.shipping_address || null
                                  );
                                  setPayment(detailRes.data.payment || null);
                                  setOrderDetail(detailRes.data);
                                }
                              }
                              showAlert(
                                `Pick up called and saved for shipment ${id}`,
                                "success"
                              );
                            } else {
                              showAlert(
                                result.message ||
                                  `Failed to call pick up for shipment ${id}`,
                                "error",
                                "ข้อผิดพลาด"
                              );
                            }
                          } catch (err) {
                            showAlert(
                              "Error: " + (err as Error).message,
                              "error",
                              "ข้อผิดพลาด"
                            );
                          }
                        }
                      }}
                    >
                      Call Pick Up
                    </button>
                    <button
                      className="px-4 py-2 rounded-xl bg-gray-500 text-white font-bold shadow-lg text-xs hover:bg-gray-600"
                      disabled={false}
                      onClick={() =>
                        selectedShipments.forEach((id) =>
                          handleCancelShipment(id)
                        )
                      }
                    >
                      ยกเลิกที่เลือก
                    </button>
                  </>
                );
              }
              if (selectedStatuses.every((st) => st === "pickedup")) {
                return (
                  <>
                    <button
                      className="px-4 py-2 rounded-xl bg-blue-500 text-white font-bold shadow-lg text-xs hover:bg-blue-600"
                      disabled={selectedShipments.length === 0}
                      onClick={async () => {
                        await handlePrintLabel();
                      }}
                    >
                      พิมพ์ Label ที่เลือก
                    </button>

                    <button
                      className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold shadow-lg text-xs hover:bg-red-600"
                      disabled={selectedShipments.length === 0}
                      onClick={async () => {
                        for (const id of selectedShipments) {
                          const shipment = shipments.find(
                            (s: any) => s.shipment_id === id
                          );
                          if (!shipment) continue;
                          if (
                            !shipment.courier_pickup.courier_pickup_id ||
                            !process.env.NEXT_PUBLIC_SHIPPOP_API_KEY
                          ) {
                            showAlert(
                              "Missing pickup ID or API key for shipment " + id,
                              "error",
                              "ข้อผิดพลาด"
                            );
                            continue;
                          }
                          try {
                            const res = await ApiService.cancelPickup({
                              api_key: process.env.NEXT_PUBLIC_SHIPPOP_API_KEY,
                              courier_pickup_id:
                                shipment.courier_pickup.courier_pickup_id,
                            });
                            const result = res as any;
                            if (result.status) {
                              // Also cancel in local system
                              await ApiService.cancelCourierPickupByShipmentId(
                                id
                              );
                              // Refresh order detail after cancellation
                              if (orderId) {
                                const detailRes =
                                  await ApiService.getAdminOrderDetail(
                                    Number(orderId)
                                  );
                                if (detailRes.success && detailRes.data) {
                                  setOrder(detailRes.data.order);
                                  setItems(detailRes.data.items || []);
                                  setShippingAddress(
                                    detailRes.data.shipping_address || null
                                  );
                                  setPayment(detailRes.data.payment || null);
                                  setOrderDetail(detailRes.data);
                                }
                              }
                              showAlert(
                                `Pickup cancelled for shipment ${id}`,
                                "success"
                              );
                            } else {
                              showAlert(
                                result.message ||
                                  `Failed to cancel pickup for shipment ${id}`,
                                "error",
                                "ข้อผิดพลาด"
                              );
                            }
                          } catch (err) {
                            showAlert(
                              "Error: " + (err as Error).message,
                              "error",
                              "ข้อผิดพลาด"
                            );
                          }
                        }
                      }}
                    >
                      Cancel Pick Up
                    </button>
                  </>
                );
              }
              // If all selected are cancelled
              if (selectedStatuses.every((st) => st === "cancelled")) {
                return (
                  <button
                    className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold shadow-lg text-xs hover:bg-red-600"
                    disabled={false}
                    onClick={() =>
                      selectedShipments.forEach((id) =>
                        handleDeleteShipment(id)
                      )
                    }
                  >
                    ลบที่เลือก
                  </button>
                );
              }
              if (selectedStatuses.every((st) => st === "pending")) {
                return (
                  <button
                    className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold shadow-lg text-xs hover:bg-red-600"
                    disabled={false}
                    onClick={() =>
                      selectedShipments.forEach((id) =>
                        handleDeleteShipment(id)
                      )
                    }
                  >
                    ลบที่เลือก
                  </button>
                );
              }

              // If mixed statuses, show nothing
              return null;
            })()}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate mb-2 rounded-xl shadow-md overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-yellow-100 to-yellow-300 dark:from-gray-800 dark:to-yellow-900">
                  <th className="py-2 px-4">
                    <input
                      type="checkbox"
                      checked={
                        selectedShipments.length === shipments.length &&
                        shipments.length > 0
                      }
                      onChange={
                        isCancelled
                          ? undefined
                          : (e) => {
                              if (e.target.checked) {
                                setSelectedShipments(
                                  shipments.map((s: any) => s.shipment_id)
                                );
                              } else {
                                setSelectedShipments([]);
                              }
                            }
                      }
                      disabled={isCancelled}
                    />
                  </th>
                  <th className="py-2 px-4">Shipment ID</th>
                  <th className="py-2 px-4">Provider Code</th>
                  <th className="py-2 px-4">Shipping Status</th>
                  <th className="py-2 px-4">External Shipment Code</th>
                  <th className="py-2 px-4">Tracking No</th>
                  <th className="py-2 px-4">Purchase ID</th>
                  <th className="py-2 px-4">Merchant Ref</th>
                  <th className="py-2 px-4">Cost</th>
                  <th className="py-2 px-4">COD Amount</th>
                  <th className="py-2 px-4">Pickup Type</th>
                  <th className="py-2 px-4">Note</th>
                  <th className="py-2 px-4">Created At</th>
                  <th className="py-2 px-4">Updated At</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((shipment: any) => (
                  <tr
                    key={shipment.shipment_id}
                    className="border-b border-yellow-100 dark:border-gray-700 group hover:bg-yellow-50 dark:hover:bg-yellow-900/40 transition-all duration-150 cursor-pointer"
                    onClick={(e) => {
                      // Prevent navigation if the click originated from the checkbox
                      if (
                        e.target instanceof HTMLInputElement &&
                        e.target.type === "checkbox"
                      ) {
                        return;
                      }
                      if (!isCancelled) {
                        router.push(
                          `/admin/order-manage/${orderId}/${shipment.shipment_id}`
                        );
                      }
                    }}
                  >
                    <td className="py-2 px-4">
                      <input
                        type="checkbox"
                        checked={selectedShipments.includes(
                          shipment.shipment_id
                        )}
                        onClick={(e) => e.stopPropagation()}
                        onChange={
                          isCancelled
                            ? undefined
                            : (e) => {
                                if (e.target.checked) {
                                  setSelectedShipments((prev: number[]) => [
                                    ...prev,
                                    shipment.shipment_id,
                                  ]);
                                } else {
                                  setSelectedShipments((prev: number[]) =>
                                    prev.filter(
                                      (id: number) =>
                                        id !== shipment.shipment_id
                                    )
                                  );
                                }
                              }
                        }
                        disabled={isCancelled}
                      />
                    </td>
                    <td className="py-2 px-4">
                      <span
                        className={
                          isCancelled
                            ? "text-blue-600 font-bold opacity-60 cursor-not-allowed"
                            : "text-blue-600 font-bold"
                        }
                      >
                        {shipment.shipment_id}
                      </span>
                    </td>
                    <td className="py-2 px-4">{shipment.provider_code}</td>
                    <td className="py-2 px-4">{shipment.shipping_status}</td>
                    <td className="py-2 px-4">
                      {shipment.external_shipment_code || "-"}
                    </td>
                    <td className="py-2 px-4">{shipment.tracking_no || "-"}</td>
                    <td className="py-2 px-4">{shipment.purchase_id || "-"}</td>
                    <td className="py-2 px-4">
                      {shipment.merchant_ref || "-"}
                    </td>
                    <td className="py-2 px-4">
                      {shipment.cost !== undefined
                        ? Number(shipment.cost).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "-"}
                    </td>
                    <td className="py-2 px-4">
                      {shipment.cod_amount !== undefined
                        ? Number(shipment.cod_amount).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )
                        : "-"}
                    </td>
                    <td className="py-2 px-4">{shipment.pickup_type || "-"}</td>
                    <td className="py-2 px-4">{shipment.note || "-"}</td>
                    <td className="py-2 px-4">{shipment.created_at}</td>
                    <td className="py-2 px-4">{shipment.updated_at}</td>
                    <td className="py-2 px-4 flex gap-2">
                      {/* Action buttons removed for batch operation */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4 justify-end items-center mt-4">
        {bookingError && (
          <span className="ml-4 text-red-600 font-bold">{bookingError}</span>
        )}
        <button
          className="fixed bottom-10 right-10 z-50 px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 animate-bounce"
          onClick={() => router.back()}
        >
          {/* Back: Arrow U-turn Left icon */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 14l-4-4m0 0l4-4m-4 4h12a4 4 0 010 8h-1"
            />
          </svg>
          <span>Back</span>
        </button>
      </div>
    </div>
  );
}
