import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search, Download, Printer, Eye, Loader2 } from "lucide-react";
import { formatTRY } from "@/lib/mock-data";
import { ChannelBadge, StatusTag } from "@/components/storefront/ChannelBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Channel, Order, OrderStatus } from "@/lib/types";
import { fetchAdminOrders } from "@/lib/api/endpoints";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Siparişler — Reis Teknik Yönetim" }] }),
  component: OrdersPage,
});

const channels: (Channel | "All")[] = ["All", "Web", "Trendyol", "Hepsiburada"];
const statuses: (OrderStatus | "All")[] = ["All", "Preparing", "Shipped", "Delivered", "Cancelled"];

function OrdersPage() {
  const [source, setSource] = useState<Channel | "All">("All");
  const [status, setStatus] = useState<OrderStatus | "All">("All");
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, isError, error } = useQuery<Order[]>({
    queryKey: ["admin", "orders", { search, status, source }],
    queryFn: ({ signal }) => fetchAdminOrders({ search, status, source }, signal),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const list = data ?? [];

  const stats = useMemo(() => ({
    total: list.length,
    preparing: list.filter((o) => o.status === "Preparing").length,
    shipped: list.filter((o) => o.status === "Shipped").length,
    revenue: list.reduce((a, o) => a + o.total, 0),
  }), [list]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight">Sipariş Yönetimi</h1>
        <p className="text-sm text-muted-foreground">Tüm kanallardan birleşik sipariş akışı</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <StatCard label="Toplam Sipariş" value={String(stats.total)} />
        <StatCard label="Hazırlanıyor" value={String(stats.preparing)} accent="warning" />
        <StatCard label="Kargoda" value={String(stats.shipped)} accent="info" />
        <StatCard label="Toplam Ciro" value={formatTRY(stats.revenue)} accent="amber" />
      </div>

      <div className="border bg-card">
        <div className="border-b p-3 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sipariş no veya müşteri..."
                className="pl-9 h-9"
              />
            </div>
            {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Button variant="outline" size="sm" className="rounded-none"><Download className="h-4 w-4" />Dışa Aktar</Button>
            <Button variant="outline" size="sm" className="rounded-none"><Printer className="h-4 w-4" />Yazdır</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterPills label="Kaynak" options={channels} value={source} onChange={(v) => setSource(v as Channel | "All")} />
            <FilterPills label="Durum" options={statuses} value={status} onChange={(v) => setStatus(v as OrderStatus | "All")} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3 font-semibold">Sipariş No</th>
                <th className="text-left p-3 font-semibold">Kaynak</th>
                <th className="text-left p-3 font-semibold">Müşteri</th>
                <th className="text-left p-3 font-semibold">Tarih</th>
                <th className="text-left p-3 font-semibold">Durum</th>
                <th className="text-left p-3 font-semibold">Kargo</th>
                <th className="text-right p-3 font-semibold">Ürün</th>
                <th className="text-right p-3 font-semibold">Tutar</th>
                <th className="p-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading && (
                <tr><td colSpan={9} className="p-12 text-center text-muted-foreground">
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" /> Siparişler yükleniyor…
                </td></tr>
              )}
              {isError && !isLoading && (
                <tr><td colSpan={9} className="p-12 text-center text-destructive">
                  Siparişler yüklenemedi: {(error as Error)?.message}
                </td></tr>
              )}
              {!isLoading && !isError && list.map((o) => (
                <tr key={o.id} className="hover:bg-muted/20">
                  <td className="p-3 font-mono text-xs font-bold">{o.orderNumber}</td>
                  <td className="p-3"><ChannelBadge channel={o.channel} /></td>
                  <td className="p-3 font-medium">{o.customerName}</td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {new Date(o.createdAt).toLocaleDateString("tr-TR")}<br />
                    <span className="opacity-70">{new Date(o.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </td>
                  <td className="p-3"><StatusTag status={o.status} /></td>
                  <td className="p-3 text-xs">
                    {o.trackingNumber ? <><div>{o.carrier}</div><div className="font-mono text-muted-foreground">{o.trackingNumber}</div></> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="p-3 text-right">{o.itemCount}</td>
                  <td className="p-3 text-right font-semibold">{formatTRY(o.total)}</td>
                  <td className="p-3"><button className="p-1 hover:bg-muted"><Eye className="h-4 w-4" /></button></td>
                </tr>
              ))}
              {!isLoading && !isError && list.length === 0 && (
                <tr><td colSpan={9} className="p-12 text-center text-muted-foreground">Kriterlere uygun sipariş bulunamadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: "warning" | "info" | "amber" }) {
  const cls = accent === "warning" ? "border-l-warning" : accent === "info" ? "border-l-info" : accent === "amber" ? "border-l-amber-brand" : "border-l-steel";
  return (
    <div className={cn("border bg-card border-l-4 p-4", cls)}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="mt-1 font-display text-xl font-bold">{value}</div>
    </div>
  );
}

function FilterPills<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mr-2">{label}:</span>
      {options.map((opt) => (
        <button key={opt} onClick={() => onChange(opt)}
          className={cn("text-xs px-2.5 py-1 border font-medium",
            value === opt ? "bg-steel text-steel-foreground border-steel" : "bg-card hover:bg-muted")}>
          {opt === "All" ? "Tümü" : opt}
        </button>
      ))}
    </div>
  );
}
