// Cancel pickup API payload
export interface CancelPickupPayload {
  api_key: string;
  courier_pickup_id: number | string;
}

// CourierPickupCreate API payload
export interface CourierPickupCreate {
  courier_ticket_id: string;
  courier_pickup_id: string;
  staff_name?: string;
  staff_phone?: string;
  order_id?: number;
  shipment_id?: number;
}

// Call to pickup API payload
export interface CallToPickupPayload {
  api_key: string;
  tracking_code: string;
}
// Label shipment API payload
export interface LabelShipmentPayload {
  api_key: string; // Api key verify Marketplace
  purchase_id?: number | string; // purchase id Shippop
  tracking_code?: string; // SHIPPOP code Ex. SP009391312,SP009391327,SP009391331
  size?:
    | "A4"
    | "A5"
    | "A6"
    | "letter"
    | "letter4x6"
    | "sticker"
    | "sticker4x6"
    | "sticker100x75"
    | "paperang";
  logo?: string; // Url logo
  schema?: "http" | "https";
  type?: "html" | "pdf" | "json";
  showproduct?: 0 | 1;
  each?: 0 | 1;
  options?: {
    [tracking_code: string]: {
      // Label Option Data Object, structure depends on API spec
      [key: string]: any;
    };
  };
  hide_information?: 0 | 1;
}
// Cancel shipment API payload
export interface CancelShipmentPayload {
  api_key: string;
  courier_tracking_code: string;
}

// Shipment detail response type
export interface ShipmentDetailResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// BookingCreate API types
export interface ShipmentPackageItem {
  order_item_id: number;
  qty?: number; // default 1
}

export interface ShipmentPackage {
  weight_kg?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  volumetric_weight_kg?: number;
  tracking_no?: string;
  label_url?: string;
  items?: ShipmentPackageItem[];
}

export interface BookingCreateRequest {
  order_id: number;
  order_items_id: number[];
  provider_code?: string;
  shipping_status?: string;
  note?: string;
  tracking_code?: string;
  price?: number;
  cod_amount?: number;
  courier_tracking_code?: string;
  purchase_id?: string;
  packages?: ShipmentPackage[];
}

export interface BookingCreateResponse {
  success: boolean;
  message?: string;
  data?: any;
}
// Admin Booking API types
export interface AdminBookingRequest {
  order_id: number;
  order_items_id: number[];
  shipment_id: number;
}

export interface AdminBookingResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Booking API types
export interface BookingProduct {
  product_code: string;
  name: string;
  category: string;
  detail: string;
  price: number;
  amount: number;
  size: string;
  color: string;
  weight: number;
}

export interface BookingAddress {
  name: string;
  address: string;
  district: string;
  state: string;
  province: string;
  postcode: string;
  tel: string;
}

export interface BookingParcel {
  name: string;
  weight: number;
  width: number;
  length: number;
  height: number;
}

export interface BookingData {
  products: { [key: string]: BookingProduct };
  from: BookingAddress;
  to: BookingAddress;
  parcel: BookingParcel;
  cod_amount: number;
  courier_code: string;
}

export interface BookingRequest {
  api_key: string;
  email: string;
  data: BookingData[];
}
export interface ShippopPriceRequest {
  api_key: string;
  data: {
    [key: string]: {
      from: {
        name: string;
        address: string;
        district: string;
        state: string;
        province: string;
        postcode: string;
        tel: string;
        lat: string;
        lng: string;
      };
      to: {
        name: string;
        address: string;
        district: string;
        state: string;
        province: string;
        postcode: string;
        tel: string;
        lat: string;
        lng: string;
      };
      parcel: {
        name: string;
        weight: number;
        width: number;
        length: number;
        height: number;
      };
      courier_code?: string;
      showall?: number;
    };
  };
}

export interface ShippopPriceResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Charge API types
export interface ChargeRequest {
  amount: number;
  token: string;
  order_id: number;
}

// Order API types
export interface UserIdRequest {
  user_id: number;
}
// Request interface for /order/get
export interface OrderIdRequest {
  order_id: number;
}
export interface CheckoutItem {
  item_code: string;
  quantity: number;
  unit_price: number;
}

export interface ShippingAddressCreate {
  first_name: string;
  last_name: string;
  phone_number: string;
  address_line1?: string;
  address_line2?: string;
  sub_district?: string;
  district?: string;
  province?: string;
  postal_code?: string;
  country?: string;
}

export interface PaymentTransactionCreate {
  amount: number;
  payment_method: string;
  proof_image?: string[];
  paid_at?: string;
  payment_status?: string;
}

export interface ShipmentItemCreate {
  order_item_id: number;
  qty: number;
}

export interface ShipmentPackageCreate {
  weight_kg?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  volumetric_weight_kg?: number;
  tracking_no?: string;
  label_url?: string;
  items?: ShipmentItemCreate[];
}

export interface ShipmentCreate {
  provider_code?: string;
  shipping_status?: string;
  merchant_ref?: string;
  external_shipment_code?: string;
  tracking_no?: string;
  purchase_id?: string;
  cost?: number;
  cod_amount?: number;
  pickup_type?: string;
  pickup_date?: string;
  label_url?: string;
  idempotency_key?: string;
  note?: string;
  packages?: ShipmentPackageCreate[];
}

export interface CheckoutRequest {
  items: CheckoutItem[];
  shipping_address: ShippingAddressCreate;
  payment: PaymentTransactionCreate;
  note?: string;
  shipments?: ShipmentCreate[];
}
// Request interface for /cart
export interface CartRequest {
  itemcode: string[];
}

// Request interface for /client/item/all-post
export interface ClientItemRequest {
  user_id: number;
}
// Item price interface
export interface ItemPrice {
  item_price_id: number;
  item_code: string;
  price_type: string;
  client_type: string;
  price: number;
  stock: number;
  sold?: number;
  created_at?: string;
  updated_at?: string;
}
export interface AddItemPayload {
  // ItemCode fields
  car_brand_abbr?: string;
  car_year_abbr?: string;
  car_type_code?: string;
  car_version_code?: string;
  car_category_abbr?: string;
  car_side_code?: string;
  car_feature_abbr?: string;
  // ItemDetail fields
  item_name: string;
  description?: string;
  po?: string;
  color?: string;
  model?: string;
  oem_no?: string;
  pk?: string;
  m3?: number | string;
  n_w?: number | string;
  g_w?: number | string;
  width?: number | string;
  height?: number | string;
  length?: number | string;
  weight?: number | string;
  // Images
  images?: File[];
}
// Car item code creation payloads
export interface CarYearCreatePayload {
  car_year_abbr: string;
  car_year: string;
}

export interface CarFeatureCreatePayload {
  car_feature_abbr: string;
  car_feature: string;
  car_feature_detail: string;
}

export interface CarSideCreatePayload {
  car_side_code: string;
  car_side: string;
}

export interface CarVersionCreatePayload {
  car_type_code: string;
  car_format_code: string;
  car_version_code: string;
  car_version: string;
}

export interface CarCategoryCreatePayload {
  car_category_abbr: string;
  car_category: string;
  car_category_detail: string;
}

export interface CarTypeCreatePayload {
  car_type_code: string;
  car_type: string;
}

export interface CarBrandCreatePayload {
  car_brand_abbr: string;
  car_brand_name: string;
}
export interface UpdateNewsDetailPayload {
  news_id: number;
  content: string;
  images?: File[];
}
export interface AddNewsPayload {
  title: string;
  content: string;
  author?: string;
  tags?: string[];
  published_at?: string;
  img?: File | null;
}

export interface AdminRegisterPayload {
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  password: string;
  permission_id?: number;
  client_type_id?: number;
  birthday?: string;
  status?: string;
  profile_picture?: File | null;
}
export interface ToggleUserStatusRequest {
  status: "active" | "inactive";
}
export interface ChangePasswordRequest {
  old_password?: string;
  new_password: string;
}
export interface UpdateClientProfilePayload {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  birthday?: string; // ISO date string
}
export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  email: string;
  phone_number: string;
  birthday: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ItemCommentCreate {
  item_code: string;
  comment: string;
  order_id?: number | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export interface AddNewsDetailPayload {
  news_id: number;
  content: string;
  images?: File[];
}

export interface NewsUpdatePayload {
  title?: string;
  content?: string;
  author?: string;
  tags?: string;
  published_at?: string;
  img?: string | File;
}
// Helper to get user_id from cookies or sessionStorage
function getUserAccessTokenFromCookieOrSession() {
  // Try cookies first
  if (typeof document === "undefined") return null;
  const access_token = document.cookie.match(/uat=([^;]+)/);
  return access_token ? decodeURIComponent(access_token[1]) : null;
}
const UserRefreshAccessToken = async () => {
  // Try to get refresh_token from cookies first, fallback to sessionStorage
  let refreshToken: string | null = null;
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/urft=([^;]+)/);
    if (match) {
      refreshToken = decodeURIComponent(match[1]);
    }
  }

  const response = await fetch(`/api/proxy/token/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (response.ok) {
    const data = await response.json();
    // เก็บ access token ใหม่ใน cookies
    // Update only access_token in user cookie if user cookie exists, otherwise create it

    document.cookie = `uat=${encodeURIComponent(
      data.access_token
    )}; path=/; max-age=3600`;
    document.cookie = `urft=${encodeURIComponent(
      data.refresh_token
    )}; path=/; max-age=5400`;
    document.cookie = `user=${encodeURIComponent(
      JSON.stringify(data.data)
    )}; path=/; max-age=5400`;
  } else {
    // ถ้า refresh token หมดอายุหรือไม่ถูกต้อง
    window.location.href = "/signin"; // ไปหน้า login
  }
};

// Build a minimal auth header when an access token is available
function buildUserAuthHeader(): { [k: string]: string } {
  const token = getUserAccessTokenFromCookieOrSession();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Wrapper around fetch that injects Authorization header for all requests
async function fetchWithUserAuth(input: RequestInfo, init?: RequestInit) {
  const _init: RequestInit = init ? { ...init } : {};
  const refresh_token = window.document.cookie.match(/urft=([^;]+)/);
  // Skip accessToken check for /api/some path
  if (
    typeof input === "string" &&
    (input.endsWith("/api/proxy/cart") ||
      input.endsWith("/api/proxy/client/item/all-post") ||
      input.endsWith("/api/proxy/news/all") ||
      input.includes("/api/proxy/item/detail/") ||
      input.includes("/api/proxy/news/") ||
      input.includes("/api/proxy/news/detail/")) &&
    !refresh_token
  ) {
    // Do nothing, allow request without accessToken
  } else {
    const accessToken = document.cookie.match(/uat=([^;]+)/);
    if (!accessToken) {
      await UserRefreshAccessToken();
    }
  }

  // Merge headers: auth header first, then existing headers override if provided.
  _init.headers = {
    ...buildUserAuthHeader(),
    ...(_init.headers as any),
  } as HeadersInit;
  return fetch(input, _init);
}

//------------------------------------------------------------------------
const AdminRefreshAccessToken = async () => {
  // Try to get refresh_token from cookies first, fallback to sessionStorage

  let refreshToken: string | null = null;
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/arft=([^;]+)/);
    if (match) {
      refreshToken = decodeURIComponent(match[1]);
    }
  }

  // if (!refreshToken) {
  //   console.warn("Admin refresh token not found, redirecting to login");
  //   // หากไม่มี refresh token หรือหมดอายุ
  //   window.location.href = "/admin"; // ไปหน้าล็อกอินใหม่
  //   return;
  // }

  const response = await fetch(`/api/proxy/token/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (response.ok) {
    const data = await response.json();
    // เก็บ access token ใหม่ใน cookies
    // store admin user object and tokens consistently (path and max-age separated by semicolons)
    document.cookie = `admin=${encodeURIComponent(
      JSON.stringify(data.data)
    )}; path=/; max-age=5400`;
    document.cookie = `arft=${encodeURIComponent(
      data.refresh_token
    )}; path=/; max-age=5400`;
    document.cookie = `aat=${encodeURIComponent(
      data.access_token
    )}; path=/; max-age=3600`;
  } else {
    // ถ้า refresh token หมดอายุหรือไม่ถูกต้อง
    window.location.href = "/admin"; // ไปหน้า login
  }
};

// Helper to get user_id from cookies or sessionStorage
function getAdminAccessTokenFromCookieOrSession() {
  // Try cookies first
  if (typeof document === "undefined") return null;
  const access_token = document.cookie.match(/aat=([^;]+)/);
  return access_token ? decodeURIComponent(access_token[1]) : null;
}
// Build a minimal auth header when an access token is available
function buildAdminAuthHeader(): { [k: string]: string } {
  const token = getAdminAccessTokenFromCookieOrSession();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Wrapper around fetch that injects Authorization header for all requests
async function fetchWithAdminAuth(input: RequestInfo, init?: RequestInit) {
  const _init: RequestInit = init ? { ...init } : {};

  // For admin requests, try to get access_token from admin cookie if available

  const accessToken = document.cookie.match(/aat=([^;]+)/);

  if (!accessToken) {
    // console.warn("Admin access token not found, refreshing...");
    await AdminRefreshAccessToken();
  }
  // Merge headers: auth header first, then existing headers override if provided.
  _init.headers = {
    ...buildAdminAuthHeader(),
    ...(_init.headers as any),
  } as HeadersInit;
  return fetch(input, _init);
}

const ApiService = {
  // Get shipment label by tracking code from Shippop via /api/label-tracking-code/
  async labelTrackingCode(payload: LabelShipmentPayload): Promise<ApiResponse> {
    try {
      const res = await fetch("/api/label-tracking-code/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Track shipment via /api/tracking/
  async trackShipment(tracking_code: string): Promise<any> {
    try {
      const res = await fetch("/api/tracking/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_code }),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Cancel courier pickup by shipment_id
  async cancelCourierPickupByShipmentId(
    shipment_id: number
  ): Promise<ApiResponse> {
    try {
      const res = await fetchWithUserAuth(
        `/api/proxy/courier-pickup/cancel/${shipment_id}`,
        {
          method: "PUT",
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Cancel pickup via /api/pickup-cancel/
  async cancelPickup(payload: CancelPickupPayload): Promise<ApiResponse> {
    try {
      const res = await fetch("/api/pickup-cancel/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Add courier pickup
  async addCourierPickup(payload: CourierPickupCreate): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/courier-pickup/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Call to pickup shipment via /api/calltopickup/
  async callToPickup(payload: CallToPickupPayload): Promise<ApiResponse> {
    try {
      const res = await fetch("/api/calltopickup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get shipment label from Shippop via /api/label/
  async labelShipment(payload: LabelShipmentPayload): Promise<ApiResponse> {
    try {
      const res = await fetch("/api/label/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Cancel shipment in local system by external_shipment_code
  async cancelAdminShipmentByExternalCode(
    external_shipment_code: string
  ): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/shipment/cancel/${external_shipment_code}`,
        {
          method: "PUT",
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  // Cancel shipment by courier_tracking_code
  async cancelShipment(payload: CancelShipmentPayload): Promise<ApiResponse> {
    try {
      const res = await fetch("/api/cancel/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Delete shipment by id
  async deleteShipment(shipment_id: number): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/shipment/delete/${shipment_id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async getShipmentDetail(
    shipment_id: number
  ): Promise<ShipmentDetailResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/shipment/detail/${shipment_id}`
      );
      const data = await res.json();
      return data;
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  },
  // Create booking (admin, minimal payload)
  async createBookingCreate(
    payload: BookingCreateRequest
  ): Promise<BookingCreateResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/booking/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async BookingConfirm(
    payload: AdminBookingRequest
  ): Promise<AdminBookingResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/admin/booking/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async createBooking(payload: BookingRequest): Promise<any> {
    try {
      const res = await fetch(`/api/booking/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get all shipping providers for admin
  async getAllShippingProviders(): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/admin/shipping-provider/all`
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get all orders for admin
  async getAllOrdersAdmin(): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/admin/orders/all`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Charge payment
  async charge(payload: ChargeRequest): Promise<ApiResponse> {
    try {
      const res = await fetchWithUserAuth(`/api/proxy/charge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get orders by user
  async getOrderByUser(): Promise<ApiResponse> {
    try {
      const res = await fetchWithUserAuth(`/api/proxy/client/order/user/get`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  // Get order by id
  async getOrderById(payload: OrderIdRequest): Promise<ApiResponse> {
    try {
      const res = await fetchWithUserAuth(`/api/proxy/client/order/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Checkout API
  async checkout(payload: CheckoutRequest): Promise<ApiResponse> {
    try {
      const res = await fetchWithUserAuth(`/api/proxy/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get cart items with POST
  async getCartItemsPost(payload: CartRequest): Promise<ApiResponse> {
    try {
      const res = await fetchWithUserAuth(`/api/proxy/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async getClientItemsPost(payload: ClientItemRequest): Promise<ApiResponse> {
    try {
      const res = await fetchWithUserAuth(`/api/proxy/client/item/all-post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get all client items
  async getAllClientItems(): Promise<ApiResponse> {
    try {
      const res = await fetchWithUserAuth(`/api/proxy/client/item/all`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get item detail by item_code
  async getItemDetail(item_code: string): Promise<ApiResponse> {
    try {
      const url = `/api/proxy/item/detail/${item_code}`;
      const res = await fetchWithUserAuth(url);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Delete item price by id
  async deleteItemPrice(item_price_id: number): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/itemprice/delete/${item_price_id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Update item price
  async updateItemPrice(
    item_price_id: number,
    payload: Partial<ItemPrice>
  ): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/itemprice/update/${item_price_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get all item prices
  async getAllItemPrices(): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/itemprice/all`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Add item price
  async addItemPrice(payload: {
    item_code: string;
    price_type?: string;
    client_type?: string;
    price: number;
    stock?: number;
  }): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/itemprice/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get all item codes
  async getAllItemCodes(): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/itemcode/all`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Delete item detail by id
  async deleteItemDetail(item_detail_id: number): Promise<ApiResponse> {
    try {
      const res = await fetchWithUserAuth(
        `/api/proxy/item/delete/${item_detail_id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Update item detail
  async updateItemDetail(
    item_detail_id: number,
    payload: AddItemPayload
  ): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      // ItemCode fields
      if (payload.car_brand_abbr)
        formData.append("car_brand_abbr", payload.car_brand_abbr);
      if (payload.car_year_abbr)
        formData.append("car_year_abbr", payload.car_year_abbr);
      if (payload.car_type_code)
        formData.append("car_type_code", payload.car_type_code);
      if (payload.car_version_code)
        formData.append("car_version_code", payload.car_version_code);
      if (payload.car_category_abbr)
        formData.append("car_category_abbr", payload.car_category_abbr);
      if (payload.car_side_code)
        formData.append("car_side_code", payload.car_side_code);
      if (payload.car_feature_abbr)
        formData.append("car_feature_abbr", payload.car_feature_abbr);
      // ItemDetail fields
      formData.append("item_name", payload.item_name);
      if (payload.description)
        formData.append("description", payload.description);
      if (payload.po) formData.append("po", payload.po);
      if (payload.color) formData.append("color", payload.color);
      if (payload.model) formData.append("model", payload.model);
      if (payload.oem_no) formData.append("oem_no", payload.oem_no);
      if (payload.pk) formData.append("pk", payload.pk);
      if (payload.m3 !== undefined && payload.m3 !== null)
        formData.append("m3", String(payload.m3));
      if (payload.n_w !== undefined && payload.n_w !== null)
        formData.append("n_w", String(payload.n_w));
      if (payload.g_w !== undefined && payload.g_w !== null)
        formData.append("g_w", String(payload.g_w));
      if (payload.width !== undefined && payload.width !== null)
        formData.append("width", String(payload.width));
      if (payload.height !== undefined && payload.height !== null)
        formData.append("height", String(payload.height));
      if (payload.length !== undefined && payload.length !== null)
        formData.append("length", String(payload.length));
      if (payload.weight !== undefined && payload.weight !== null)
        formData.append("weight", String(payload.weight));
      // Images
      if (payload.images && Array.isArray(payload.images)) {
        payload.images.forEach((file) => {
          if (file instanceof File) formData.append("images", file);
        });
      }
      const res = await fetchWithAdminAuth(
        `/api/proxy/item/update/${item_detail_id}`,
        {
          method: "PUT",
          body: formData,
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Add item (item code + item detail + images)
  async addItem(payload: AddItemPayload): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      // ItemCode fields
      if (payload.car_brand_abbr)
        formData.append("car_brand_abbr", payload.car_brand_abbr);
      if (payload.car_year_abbr)
        formData.append("car_year_abbr", payload.car_year_abbr);
      if (payload.car_type_code)
        formData.append("car_type_code", payload.car_type_code);
      if (payload.car_version_code)
        formData.append("car_version_code", payload.car_version_code);
      if (payload.car_category_abbr)
        formData.append("car_category_abbr", payload.car_category_abbr);
      if (payload.car_side_code)
        formData.append("car_side_code", payload.car_side_code);
      if (payload.car_feature_abbr)
        formData.append("car_feature_abbr", payload.car_feature_abbr);
      // ItemDetail fields
      formData.append("item_name", payload.item_name);
      if (payload.description)
        formData.append("description", payload.description);
      if (payload.po) formData.append("po", payload.po);
      if (payload.color) formData.append("color", payload.color);
      if (payload.model) formData.append("model", payload.model);
      if (payload.oem_no) formData.append("oem_no", payload.oem_no);
      if (payload.pk) formData.append("pk", payload.pk);
      if (payload.m3 !== undefined && payload.m3 !== null)
        formData.append("m3", String(payload.m3));
      if (payload.n_w !== undefined && payload.n_w !== null)
        formData.append("n_w", String(payload.n_w));
      if (payload.g_w !== undefined && payload.g_w !== null)
        formData.append("g_w", String(payload.g_w));
      if (payload.width !== undefined && payload.width !== null)
        formData.append("width", String(payload.width));
      if (payload.height !== undefined && payload.height !== null)
        formData.append("height", String(payload.height));
      if (payload.length !== undefined && payload.length !== null)
        formData.append("length", String(payload.length));
      if (payload.weight !== undefined && payload.weight !== null)
        formData.append("weight", String(payload.weight));
      // Images
      if (payload.images && Array.isArray(payload.images)) {
        payload.images.forEach((file) => {
          if (file instanceof File) formData.append("images", file);
        });
      }
      const res = await fetchWithAdminAuth(`/api/proxy/item/add`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Delete car feature by id
  async deleteCarFeature(car_feature_id: number): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/car-feature/delete/${car_feature_id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Delete car year by id
  async deleteCarYear(car_year_id: number): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/car-year/delete/${car_year_id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Delete car side by id
  async deleteCarSide(car_side_id: number): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/car-side/delete/${car_side_id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Delete car version by id
  async deleteCarVersion(car_version_id: number): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/car-version/delete/${car_version_id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Delete car category by id
  async deleteCarCategory(car_category_id: number): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/car-category/delete/${car_category_id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Delete car type by id
  async deleteCarType(car_type_id: number): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/car-type/delete/${car_type_id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Delete car brand by id
  async deleteCarBrand(car_brand_id: number): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/car-brand/delete/${car_brand_id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get all car years
  async getAllCarYears(): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/car-year/all`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get all car features
  async getAllCarFeatures(): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/car-feature/all`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get all car sides
  async getAllCarSides(): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/car-side/all`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get all car versions
  async getAllCarVersions(): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/car-version/all`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get all car categories
  async getAllCarCategories(): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/car-category/all`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get all car types
  async getAllCarTypes(): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/car-type/all`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get all car brands
  async getAllCarBrands(): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/car-brand/all`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Get all items
  async getAllItems(): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/item/all`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Car Feature
  async addCarFeature(payload: CarFeatureCreatePayload): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/car-feature/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Car Side
  async addCarSide(payload: CarSideCreatePayload): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/car-side/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Car Category
  async addCarCategory(
    payload: CarCategoryCreatePayload
  ): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/car-category/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Car Version
  async addCarVersion(payload: CarVersionCreatePayload): Promise<ApiResponse> {
    try {
      const body = {
        car_type_code: payload.car_type_code,
        car_format_code: payload.car_format_code,
        car_version_code: payload.car_version_code,
        car_version: payload.car_version,
      };
      const res = await fetchWithAdminAuth(`/api/proxy/car-version/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Car Type
  async addCarType(payload: CarTypeCreatePayload): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/car-type/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Car Year
  async addCarYear(payload: CarYearCreatePayload): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/car-year/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Car Brand
  async addCarBrand(payload: CarBrandCreatePayload): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/car-brand/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async updateNewsDetail(
    news_detail_id: number,
    payload: UpdateNewsDetailPayload
  ): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append("content", payload.content);
      // Always append news_id for backend compatibility
      formData.append("news_id", String(payload.news_id));
      if (payload.images && Array.isArray(payload.images)) {
        payload.images.forEach((file) => {
          if (file instanceof File) formData.append("images", file);
        });
      }
      const res = await fetchWithAdminAuth(
        `/api/proxy/news/detail/update/${news_detail_id}`,
        {
          method: "PUT",
          body: formData,
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Admin endpoint: update news
  async updateNews(
    news_id: number,
    payload: NewsUpdatePayload
  ): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      if (payload.title !== undefined) formData.append("title", payload.title);
      if (payload.content !== undefined)
        formData.append("content", payload.content);
      if (payload.author !== undefined)
        formData.append("author", payload.author);
      if (payload.tags !== undefined) formData.append("tags", payload.tags);
      if (payload.published_at !== undefined)
        formData.append("published_at", payload.published_at);
      if (payload.img instanceof File) {
        formData.append("img", payload.img);
      }
      const res = await fetchWithAdminAuth(
        `/api/proxy/admin/news/update/${news_id}`,
        {
          method: "PUT",
          body: formData,
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Public endpoint: add news detail
  async addNewsDetail(payload: AddNewsDetailPayload): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append("news_id", String(payload.news_id));
      formData.append("content", payload.content);
      if (payload.images && Array.isArray(payload.images)) {
        payload.images.forEach((file) => {
          if (file instanceof File) formData.append("images", file);
        });
      }
      const res = await fetchWithAdminAuth(`/api/proxy/news/detail/add`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  // Public endpoint: get news detail by id
  async getNewsDetailById(news_id: number): Promise<ApiResponse> {
    try {
      const res = await fetchWithUserAuth(`/api/proxy/news/detail/${news_id}`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async getNewsById(news_id: number): Promise<ApiResponse> {
    try {
      const res = await fetchWithUserAuth(`/api/proxy/news/${news_id}`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async deleteNews(news_id: number): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/admin/news/delete/${news_id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async getAllNews(): Promise<ApiResponse> {
    try {
      const res = await fetchWithUserAuth(`/api/proxy/news/all`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async addNews(payload: AddNewsPayload): Promise<ApiResponse> {
    try {
      const fd = new FormData();
      fd.append("title", payload.title);
      fd.append("content", payload.content);
      if (payload.author) fd.append("author", payload.author);
      if (payload.tags && Array.isArray(payload.tags)) {
        payload.tags.forEach((tag) => fd.append("tags", tag));
      }
      if (payload.published_at) fd.append("published_at", payload.published_at);
      if (payload.img instanceof File) fd.append("img", payload.img);
      const res = await fetchWithAdminAuth(`/api/proxy/admin/news/add`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async adminLogin(payload: LoginPayload): Promise<ApiResponse> {
    try {
      const res = await fetch(`/api/proxy/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async deleteUser(user_id: number): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/admin/delete-user/${user_id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async toggleUserStatus(
    user_id: number,
    status: ToggleUserStatusRequest | string
  ): Promise<ApiResponse> {
    try {
      const statusValue = typeof status === "string" ? status : status.status;
      const res = await fetchWithAdminAuth(
        `/api/proxy/admin/toggle-user-status/${user_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: statusValue }),
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async updateUser(
    user_id: number,
    payload: AdminRegisterPayload
  ): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (key === "profile_picture" && value instanceof File) {
            formData.append("profile_picture", value);
          } else {
            formData.append(key, value as any);
          }
        }
      });
      const res = await fetchWithAdminAuth(
        `/api/proxy/admin/update-user/${user_id}`,
        {
          method: "PUT",
          body: formData,
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async getAllUsers(): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/admin/users`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  async adminRegister(payload: AdminRegisterPayload): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (key === "profile_picture" && value instanceof File) {
            formData.append("profile_picture", value);
          } else {
            formData.append(key, value as any);
          }
        }
      });
      const res = await fetchWithAdminAuth(`/api/proxy/admin/register`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  async getAllClientTypes(): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/admin/get-all-client-types`
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  async getAllPermissions(): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/admin/get-all-permissions`
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async changePassword(payload: ChangePasswordRequest): Promise<ApiResponse> {
    try {
      console.log("Changing password for payload:", payload);
      const res = await fetchWithUserAuth(
        `/api/proxy/client/change-password/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async updateProfile(
    payload: UpdateClientProfilePayload & { profile_picture?: File | null }
  ): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (key === "profile_picture" && value instanceof File) {
            formData.append("profile_picture", value);
          } else {
            formData.append(key, value as string);
          }
        }
      });
      const res = await fetchWithUserAuth(`/api/proxy/client/profile/`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async updateAdminProfile(
    payload: UpdateClientProfilePayload & { profile_picture?: File | null }
  ): Promise<ApiResponse> {
    try {
      // console.log("Updating admin profile with payload:", payload);
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (key === "profile_picture" && value instanceof File) {
            formData.append("profile_picture", value);
          } else {
            formData.append(key, value as string);
          }
        }
      });
      const res = await fetchWithAdminAuth(`/api/proxy/admin/profile/`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async getProfile(): Promise<ApiResponse> {
    try {
      const res = await fetchWithUserAuth(`/api/proxy/client/profile/`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async login(payload: LoginPayload): Promise<ApiResponse> {
    try {
      const res = await fetch(`/api/proxy/client/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  // Admin get order detail by order_id
  async getAdminOrderDetail(order_id: number): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/admin/order/detail/${order_id}`
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  // Admin: update payment status by order_id
  async updatePaymentStatusByOrder(order_id: number): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(
        `/api/proxy/payment_transaction/update_status/${order_id}`,
        {
          method: "PUT",
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  // Admin: cancel order by order_id (proxy to backend)
  async cancelUserOrder(order_id: number): Promise<ApiResponse> {
    try {
      // Use the internal proxy so cookies/auth are preserved
      const res = await fetchWithUserAuth(
        `/api/user/order/cancel/${order_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  // Client: buy again an order by order_id using internal proxy
  async buyAgainOrder(order_id: number): Promise<ApiResponse> {
    try {
      // Call the client buyagain proxy route so auth/cookies are forwarded
      const res = await fetchWithUserAuth(
        `/api/client/order/buyagain/${order_id}`
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  // Upsert item rating (client-facing proxy to backend)
  async upsertItemRating(payload: {
    item_code: string;
    rating: number;
    order_id?: number | null;
  }): Promise<ApiResponse> {
    try {
      const res = await fetchWithUserAuth(`/api/item/rating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  // Admin: get payment amount timeseries
  async getPaymentAmountTimeseries(params: {
    start_date?: string;
    end_date?: string;
    interval?: string; // 'day' | 'week' | 'month'
  }): Promise<ApiResponse> {
    try {
      const qs = new URLSearchParams();
      if (params.start_date) qs.set("start_date", params.start_date);
      if (params.end_date) qs.set("end_date", params.end_date);
      qs.set("interval", params.interval || "day");

      const url = `/api/proxy/admin/payment/amount-timeseries?${qs.toString()}`;
      const res = await fetchWithAdminAuth(url);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  // Admin get profile
  async getAdminProfile(): Promise<ApiResponse> {
    try {
      const res = await fetchWithAdminAuth(`/api/proxy/admin/profile/`);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  async register(payload: RegisterPayload): Promise<ApiResponse> {
    try {
      const res = await fetch(`/api/proxy/client/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async getShippopPrice(
    payload: ShippopPriceRequest
  ): Promise<ShippopPriceResponse> {
    try {
      const res = await fetch(`/api/pricelist/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
  async upsertItemComment(payload: ItemCommentCreate): Promise<ApiResponse> {
    try {
      const res = await fetchWithUserAuth(`/api/item/comment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  // Mark notifications as read (optional single notification_id)
  async markNotificationsRead(notification_id?: number): Promise<ApiResponse> {
    try {
      const body: any = {};
      if (typeof notification_id !== "undefined" && notification_id !== null)
        body.notification_id = notification_id;
      const res = await fetchWithUserAuth(`/api/proxy/notifications/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  // Admin: Mark notifications as read (optional single notification_id)
  async markAdminNotificationsRead(
    notification_id?: number
  ): Promise<ApiResponse> {
    try {
      const body: any = {};
      if (typeof notification_id !== "undefined" && notification_id !== null)
        body.notification_id = notification_id;
      const res = await fetchWithAdminAuth(`/api/proxy/notifications/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  // Admin analytics endpoints
  async getTopRepeatBuyers(): Promise<ApiResponse> {
    try {
      const url = `/api/proxy/admin/analytics/top-repeat-buyers`;
      const res = await fetchWithAdminAuth(url);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  async getTopSellingItems(): Promise<ApiResponse> {
    try {
      const url = `/api/proxy/admin/analytics/top-selling-items`;
      const res = await fetchWithAdminAuth(url);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  async getTopRatedItems(): Promise<ApiResponse> {
    try {
      const url = `/api/proxy/admin/analytics/top-rated-items`;
      const res = await fetchWithAdminAuth(url);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  async getTopBuyersByQuantity(): Promise<ApiResponse> {
    try {
      const url = `/api/proxy/admin/analytics/top-buyers-by-quantity`;
      const res = await fetchWithAdminAuth(url);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  async getTopProvincesRepeatUsers(): Promise<ApiResponse> {
    try {
      const url = `/api/proxy/admin/analytics/top-provinces-repeat-users`;
      const res = await fetchWithAdminAuth(url);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  async getTopProvincesByQuantity(): Promise<ApiResponse> {
    try {
      const url = `/api/proxy/admin/analytics/top-provinces-by-amount`;
      const res = await fetchWithAdminAuth(url);
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },
};

export default ApiService;
