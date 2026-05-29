// Typed interfaces matching the .NET 10 backend API contract.

export type Channel = "Web" | "Trendyol" | "Hepsiburada";
export type OrderStatus = "Preparing" | "Shipped" | "Delivered" | "Cancelled" | "Returned";
export type PaymentGateway = "PayTR" | "iyzico";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string; // e.g. "18V / 5.0Ah"
  price: number;
  stock: number;
  barcode?: string;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  brand: Brand;
  category: Category;
  price: number;
  listPrice?: number;
  currency: "TRY";
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stock: number;
  variants: ProductVariant[];
  tags: string[];
  channels: Channel[];
}

export interface CartLine {
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  image?: string;
}

export interface AddressDto {
  fullName: string;
  phone: string;
  city: string;
  district: string;
  line1: string;
  postalCode?: string;
}

export interface CorporateInvoiceProfile {
  companyTitle: string;
  taxOffice: string;
  taxNumber: string;
  eInvoice: boolean;
}

export interface CheckoutConsents {
  kvkk: boolean;
  acikRiza: boolean;
  mesafeliSatis: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  channel: Channel;
  status: OrderStatus;
  customerName: string;
  total: number;
  itemCount: number;
  createdAt: string; // ISO
  trackingNumber?: string;
  carrier?: string;
  lines: CartLine[];
}

export interface SalesPoint {
  date: string;
  web: number;
  trendyol: number;
  hepsiburada: number;
}

export interface LowStockItem {
  productId: string;
  sku: string;
  name: string;
  stock: number;
  threshold: number;
}

export interface PaymentGatewayConfig {
  gateway: PaymentGateway;
  active: boolean;
  merchantId: string;
  apiKey: string;
  apiSecret: string;
  testMode: boolean;
}

export interface InstallmentRow {
  bank: string;
  installments: number;
  rate: number; // percent
}

export interface PaymentTxLog {
  id: string;
  gateway: PaymentGateway;
  orderNumber: string;
  amount: number;
  status: "Success" | "Failed" | "Refunded";
  createdAt: string;
}

export interface TrendyolImportCredentials {
  supplierId: string;
  apiKey: string;
  apiSecret: string;
}
