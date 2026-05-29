import type {
  Brand, Category, Product, Order, SalesPoint, LowStockItem,
  PaymentGatewayConfig, InstallmentRow, PaymentTxLog,
} from "./types";

export const brands: Brand[] = [
  { id: "b1", name: "Bosch", slug: "bosch" },
  { id: "b2", name: "Makita", slug: "makita" },
  { id: "b3", name: "DeWalt", slug: "dewalt" },
  { id: "b4", name: "Stanley", slug: "stanley" },
  { id: "b5", name: "Hilti", slug: "hilti" },
  { id: "b6", name: "Karcher", slug: "karcher" },
];

export const categories: Category[] = [
  { id: "c1", name: "Elektrikli El Aletleri", slug: "elektrikli-el-aletleri" },
  { id: "c2", name: "Bağlantı Elemanları", slug: "baglanti-elemanlari" },
  { id: "c3", name: "İş Güvenliği", slug: "is-guvenligi" },
  { id: "c4", name: "El Aletleri", slug: "el-aletleri" },
  { id: "c5", name: "Ölçü ve Kontrol", slug: "olcu-kontrol" },
  { id: "c6", name: "Kesici Takımlar", slug: "kesici-takimlar" },
];

const img = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=70`;

export const products: Product[] = [
  {
    id: "p1", sku: "BSH-GSB18V-50", slug: "bosch-gsb-18v-50-darbeli-matkap",
    name: "Bosch GSB 18V-50 Akülü Darbeli Matkap",
    shortDescription: "18V Brushless, 55Nm tork, 2x5.0Ah akü dahil",
    description: "Profesyoneller için kompakt ve güçlü 18V akülü darbeli matkap. Fırçasız motor, metal şanzıman, LED aydınlatma.",
    brand: brands[0], category: categories[0],
    price: 7499, listPrice: 8990, currency: "TRY",
    images: [img("photo-1504148455328-c376907d081c"), img("photo-1572981779307-38b8cabb2407")],
    rating: 4.7, reviewCount: 142, inStock: true, stock: 24,
    variants: [
      { id: "v1", sku: "BSH-GSB18V-50-1", name: "1x4.0Ah", price: 6499, stock: 8 },
      { id: "v2", sku: "BSH-GSB18V-50-2", name: "2x5.0Ah", price: 7499, stock: 16 },
    ],
    tags: ["matkap", "akülü", "brushless"], channels: ["Web", "Trendyol", "Hepsiburada"],
  },
  {
    id: "p2", sku: "MKT-DTW1002", slug: "makita-dtw1002-darbeli-somun-sikma",
    name: "Makita DTW1002 18V Darbeli Somun Sıkma",
    shortDescription: "1000Nm tork, fırçasız motor",
    description: "Endüstriyel uygulamalar için yüksek torklu darbeli somun sıkma makinesi.",
    brand: brands[1], category: categories[0],
    price: 12990, currency: "TRY",
    images: [img("photo-1530124566582-a618bc2615dc")],
    rating: 4.9, reviewCount: 87, inStock: true, stock: 6,
    variants: [], tags: ["somun sıkma", "endüstriyel"], channels: ["Web", "Trendyol"],
  },
  {
    id: "p3", sku: "DWT-DCD777", slug: "dewalt-dcd777-akulu-matkap",
    name: "DeWalt DCD777 18V Akülü Matkap Vidalama",
    shortDescription: "Kompakt boyut, 65Nm tork",
    description: "Günlük kullanım için ideal vidalama makinesi.",
    brand: brands[2], category: categories[0],
    price: 5290, listPrice: 5990, currency: "TRY",
    images: [img("photo-1567361808960-dec9cb578182")],
    rating: 4.6, reviewCount: 203, inStock: true, stock: 41,
    variants: [], tags: ["vidalama"], channels: ["Web", "Hepsiburada"],
  },
  {
    id: "p4", sku: "STN-FMHT0", slug: "stanley-fatmax-cekic",
    name: "Stanley FatMax 450g Çelik Saplı Çekiç",
    shortDescription: "Anti-vibrasyon, taklit oluşturma kafa",
    description: "Profesyonel ustalar için dengeli ve dayanıklı çekiç.",
    brand: brands[3], category: categories[3],
    price: 549, currency: "TRY",
    images: [img("photo-1426927308491-6380b6a9936f")],
    rating: 4.8, reviewCount: 312, inStock: true, stock: 120,
    variants: [], tags: ["çekiç", "el aleti"], channels: ["Web", "Trendyol", "Hepsiburada"],
  },
  {
    id: "p5", sku: "HLT-TE6", slug: "hilti-te6-a36-kirici-delici",
    name: "Hilti TE 6-A36 Akülü Kırıcı Delici",
    shortDescription: "SDS-Plus, 36V, AVR titreşim azaltma",
    description: "Beton ve duvar için profesyonel kırıcı delici.",
    brand: brands[4], category: categories[0],
    price: 24990, currency: "TRY",
    images: [img("photo-1581092160562-40aa08e78837")],
    rating: 4.9, reviewCount: 56, inStock: false, stock: 0,
    variants: [], tags: ["kırıcı", "delici", "sds"], channels: ["Web"],
  },
  {
    id: "p6", sku: "SAF-HLM01", slug: "endustriyel-baret-sari",
    name: "EN397 Sertifikalı Endüstriyel Baret - Sarı",
    shortDescription: "ABS, ayarlanabilir, ter bandı dahil",
    description: "İnşaat ve sanayi için CE EN397 sertifikalı baret.",
    brand: brands[3], category: categories[2],
    price: 189, currency: "TRY",
    images: [img("photo-1581092335397-9583eb92d232")],
    rating: 4.5, reviewCount: 89, inStock: true, stock: 240,
    variants: [
      { id: "v3", sku: "SAF-HLM01-Y", name: "Sarı", price: 189, stock: 120 },
      { id: "v4", sku: "SAF-HLM01-W", name: "Beyaz", price: 189, stock: 80 },
      { id: "v5", sku: "SAF-HLM01-R", name: "Kırmızı", price: 199, stock: 40 },
    ],
    tags: ["baret", "güvenlik", "kvk"], channels: ["Web", "Trendyol", "Hepsiburada"],
  },
  {
    id: "p7", sku: "FST-M8-100", slug: "m8-civata-paslanmaz",
    name: "M8x50 DIN933 Paslanmaz Çelik Cıvata (100 Adet)",
    shortDescription: "A2-70 paslanmaz, tam diş",
    description: "Endüstriyel montaj için A2 paslanmaz cıvata seti.",
    brand: brands[3], category: categories[1],
    price: 379, currency: "TRY",
    images: [img("photo-1609205807107-454f1d4ba07e")],
    rating: 4.7, reviewCount: 45, inStock: true, stock: 540,
    variants: [], tags: ["cıvata", "paslanmaz"], channels: ["Web", "Trendyol"],
  },
  {
    id: "p8", sku: "KRC-K5", slug: "karcher-k5-yikama",
    name: "Karcher K5 Power Control Basınçlı Yıkama",
    shortDescription: "145 bar, 500 L/saat, indüksiyon motor",
    description: "Araç, bahçe ve cephe temizliği için yüksek performanslı yıkama.",
    brand: brands[5], category: categories[0],
    price: 9890, listPrice: 11490, currency: "TRY",
    images: [img("photo-1558618666-fcd25c85cd64")],
    rating: 4.8, reviewCount: 178, inStock: true, stock: 3,
    variants: [], tags: ["yıkama", "basınçlı"], channels: ["Web", "Hepsiburada"],
  },
];

export const salesSeries: SalesPoint[] = Array.from({ length: 14 }).map((_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (13 - i));
  return {
    date: d.toISOString().slice(5, 10),
    web: 18000 + Math.round(Math.sin(i / 2) * 6000 + Math.random() * 4000),
    trendyol: 24000 + Math.round(Math.cos(i / 3) * 8000 + Math.random() * 5000),
    hepsiburada: 12000 + Math.round(Math.sin(i / 1.7) * 4000 + Math.random() * 3000),
  };
});

export const lowStock: LowStockItem[] = [
  { productId: "p8", sku: "KRC-K5", name: "Karcher K5 Power Control", stock: 3, threshold: 10 },
  { productId: "p5", sku: "HLT-TE6", name: "Hilti TE 6-A36 Kırıcı", stock: 0, threshold: 5 },
  { productId: "p2", sku: "MKT-DTW1002", name: "Makita DTW1002", stock: 6, threshold: 10 },
];

export const orders: Order[] = [
  {
    id: "o1", orderNumber: "RT-2025-10481", channel: "Trendyol", status: "Preparing",
    customerName: "Mehmet Yılmaz", total: 7499, itemCount: 1,
    createdAt: "2026-05-27T09:14:00Z",
    lines: [{ productId: "p1", name: "Bosch GSB 18V-50", sku: "BSH-GSB18V-50", unitPrice: 7499, quantity: 1 }],
  },
  {
    id: "o2", orderNumber: "RT-2025-10482", channel: "Web", status: "Shipped",
    customerName: "Ayşe Kaya İnşaat", total: 4527, itemCount: 12,
    createdAt: "2026-05-27T07:51:00Z", trackingNumber: "ARS9982341", carrier: "Aras Kargo",
    lines: [{ productId: "p7", name: "M8x50 Cıvata", sku: "FST-M8-100", unitPrice: 379, quantity: 12 }],
  },
  {
    id: "o3", orderNumber: "RT-2025-10483", channel: "Hepsiburada", status: "Delivered",
    customerName: "Can Demir", total: 9890, itemCount: 1,
    createdAt: "2026-05-26T18:22:00Z", trackingNumber: "MNG7711209", carrier: "MNG Kargo",
    lines: [{ productId: "p8", name: "Karcher K5", sku: "KRC-K5", unitPrice: 9890, quantity: 1 }],
  },
  {
    id: "o4", orderNumber: "RT-2025-10484", channel: "Web", status: "Preparing",
    customerName: "Zeynep Çelik Ltd. Şti.", total: 12990, itemCount: 1,
    createdAt: "2026-05-28T05:02:00Z",
    lines: [{ productId: "p2", name: "Makita DTW1002", sku: "MKT-DTW1002", unitPrice: 12990, quantity: 1 }],
  },
  {
    id: "o5", orderNumber: "RT-2025-10485", channel: "Trendyol", status: "Delivered",
    customerName: "Hasan Öztürk", total: 738, itemCount: 2,
    createdAt: "2026-05-25T12:30:00Z", trackingNumber: "YK11203", carrier: "Yurtiçi Kargo",
    lines: [{ productId: "p6", name: "EN397 Baret", sku: "SAF-HLM01", unitPrice: 189, quantity: 2 }],
  },
  {
    id: "o6", orderNumber: "RT-2025-10486", channel: "Web", status: "Cancelled",
    customerName: "Elif Şahin", total: 549, itemCount: 1,
    createdAt: "2026-05-24T16:14:00Z",
    lines: [{ productId: "p4", name: "Stanley FatMax Çekiç", sku: "STN-FMHT0", unitPrice: 549, quantity: 1 }],
  },
];

export const paymentConfigs: PaymentGatewayConfig[] = [
  { gateway: "iyzico", active: true, merchantId: "IYZ-92314", apiKey: "sandbox-AbcXyz...", apiSecret: "•••••••••", testMode: false },
  { gateway: "PayTR", active: false, merchantId: "", apiKey: "", apiSecret: "", testMode: true },
];

export const installmentRows: InstallmentRow[] = [
  { bank: "Garanti BBVA", installments: 3, rate: 0 },
  { bank: "Garanti BBVA", installments: 6, rate: 4.2 },
  { bank: "Garanti BBVA", installments: 9, rate: 7.8 },
  { bank: "Akbank", installments: 3, rate: 0 },
  { bank: "Akbank", installments: 6, rate: 3.9 },
  { bank: "Yapı Kredi", installments: 3, rate: 0 },
  { bank: "Yapı Kredi", installments: 9, rate: 8.4 },
  { bank: "İş Bankası", installments: 6, rate: 4.5 },
  { bank: "Ziraat", installments: 3, rate: 0 },
];

export const txLogs: PaymentTxLog[] = [
  { id: "t1", gateway: "iyzico", orderNumber: "RT-2025-10485", amount: 738, status: "Success", createdAt: "2026-05-25T12:30:00Z" },
  { id: "t2", gateway: "iyzico", orderNumber: "RT-2025-10484", amount: 12990, status: "Success", createdAt: "2026-05-28T05:02:00Z" },
  { id: "t3", gateway: "iyzico", orderNumber: "RT-2025-10486", amount: 549, status: "Refunded", createdAt: "2026-05-24T16:20:00Z" },
  { id: "t4", gateway: "PayTR", orderNumber: "RT-2025-10470", amount: 1899, status: "Failed", createdAt: "2026-05-23T10:00:00Z" },
];

export const formatTRY = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
