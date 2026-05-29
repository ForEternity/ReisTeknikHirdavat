// Typed endpoint wrappers for the .NET 10 Web API.
import { api } from "./client";
import type {
  Order,
  Channel,
  OrderStatus,
  TrendyolImportCredentials,
  CartLine,
} from "@/lib/types";

// ---------- Admin Dashboard ----------

export interface DashboardRecentOrder {
  id: string;
  orderNumber: string;
  channel: Channel;
  status: OrderStatus;
  customerName: string;
  total: number;
  createdAt: string;
}

export interface DashboardMetrics {
  totalSalesAmount: number;
  totalOrderCount: number;
  criticalStockCount: number;
  webOrderCount: number;
  trendyolOrderCount: number;
  hepsiburadaOrderCount: number;
  recentOrders: DashboardRecentOrder[];
}

export const fetchDashboardMetrics = (signal?: AbortSignal) =>
  api.get<DashboardMetrics>("/api/admin/dashboard-metrics", { signal });

// ---------- Admin Orders ----------

export interface AdminOrdersQuery {
  search?: string;
  status?: OrderStatus | "All";
  source?: Channel | "All";
}

export const fetchAdminOrders = (q: AdminOrdersQuery, signal?: AbortSignal) =>
  api.get<Order[]>("/api/admin/orders", {
    signal,
    query: {
      search: q.search,
      status: q.status && q.status !== "All" ? q.status : undefined,
      source: q.source && q.source !== "All" ? q.source : undefined,
    },
  });

// ---------- Trendyol Integration ----------

export interface TrendyolSyncResult {
  importedCount: number;
  message?: string;
}

export const syncTrendyol = (creds: TrendyolImportCredentials) =>
  api.post<TrendyolSyncResult>("/api/integration/sync-trendyol", creds);

// ---------- Checkout / Orders ----------

export interface CheckoutAddressPayload {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  postalCode?: string;
  line1: string;
}

export interface CheckoutCorporatePayload {
  companyName: string;
  taxOffice: string;
  taxNumber: string;
  eInvoice: boolean;
}

export interface CreateOrderPayload {
  address: CheckoutAddressPayload;
  corporateInvoice?: CheckoutCorporatePayload;
  paymentGateway: "iyzico" | "PayTR";
  items: Array<Pick<CartLine, "productId" | "variantId" | "sku" | "name" | "unitPrice" | "quantity">>;
  kvkkApproved: boolean;
  mssApproved: boolean;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  paymentRedirectUrl?: string;
}

export const createOrder = (payload: CreateOrderPayload) =>
  api.post<CreateOrderResponse>("/api/orders", payload);
