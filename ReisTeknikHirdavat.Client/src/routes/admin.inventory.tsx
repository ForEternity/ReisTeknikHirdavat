import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Plus, Filter, Search, MoreVertical } from "lucide-react";
import { products, formatTRY } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { TrendyolImportCredentials } from "@/lib/types";
import { syncTrendyol } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({ meta: [{ title: "Envanter — Reis Teknik Yönetim" }] }),
  component: Inventory,
});

function Inventory() {
  const [creds, setCreds] = useState<TrendyolImportCredentials>({ supplierId: "", apiKey: "", apiSecret: "" });
  const [importing, setImporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const runImport = async () => {
    if (!creds.supplierId || !creds.apiKey || !creds.apiSecret) {
      toast.error("Tüm API bilgileri zorunludur"); return;
    }
    setImporting(true);
    try {
      const result = await syncTrendyol(creds);
      setDialogOpen(false);
      toast.success(result.message ?? `Trendyol'dan ${result.importedCount} ürün aktarıldı`);
      setCreds({ supplierId: "", apiKey: "", apiSecret: "" });
    } catch (err) {
      // apiFetch already shows an error toast; swallow to keep dialog open.
      if (!(err instanceof ApiError)) throw err;
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight">Envanter Yönetimi</h1>
          <p className="text-sm text-muted-foreground">12.041 aktif SKU · 248 düşük stok · 41 tükendi</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-channel-trendyol text-white hover:bg-channel-trendyol/90 rounded-none uppercase">
                <Download className="h-4 w-4" />Trendyol'dan Ürünleri Aktar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display uppercase">Trendyol API Bağlantısı</DialogTitle>
                <DialogDescription>
                  Satıcı paneli &gt; Hesabım &gt; Entegrasyon Bilgileri'nden alabilirsiniz.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">SupplierID</Label>
                  <Input value={creds.supplierId} onChange={(e) => setCreds({ ...creds, supplierId: e.target.value })} placeholder="123456" />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">API Key</Label>
                  <Input value={creds.apiKey} onChange={(e) => setCreds({ ...creds, apiKey: e.target.value })} placeholder="Trendyol API Key" />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">API Secret</Label>
                  <Input type="password" value={creds.apiSecret} onChange={(e) => setCreds({ ...creds, apiSecret: e.target.value })} placeholder="••••••••••••" />
                </div>
                <div className="border-l-2 border-amber-brand bg-amber-brand/5 px-3 py-2 text-xs">
                  Bilgileriniz şifrelenerek saklanır ve yalnızca Trendyol API çağrılarında kullanılır.
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-none">İptal</Button>
                <Button onClick={runImport} disabled={importing} className="bg-amber-brand text-amber-brand-foreground hover:bg-amber-brand/90 rounded-none uppercase">
                  {importing ? "Aktarılıyor..." : "Aktarımı Başlat"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="rounded-none"><Plus className="h-4 w-4" />Ürün Ekle</Button>
        </div>
      </div>

      <div className="border bg-card">
        <div className="flex items-center gap-3 border-b p-3 bg-muted/30">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="SKU, ürün adı veya marka..." className="pl-9 h-9" />
          </div>
          <Button variant="outline" size="sm" className="rounded-none"><Filter className="h-4 w-4" />Filtre</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3 font-semibold w-8"><input type="checkbox" /></th>
                <th className="text-left p-3 font-semibold">Ürün</th>
                <th className="text-left p-3 font-semibold">SKU</th>
                <th className="text-left p-3 font-semibold">Marka</th>
                <th className="text-left p-3 font-semibold">Varyant</th>
                <th className="text-right p-3 font-semibold">Fiyat</th>
                <th className="text-right p-3 font-semibold">Stok</th>
                <th className="text-left p-3 font-semibold">Kanallar</th>
                <th className="p-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.flatMap((p) => {
                const rows = p.variants.length > 0 ? p.variants.map((v) => ({
                  key: v.id, name: p.name, variant: v.name, sku: v.sku, price: v.price, stock: v.stock, brand: p.brand.name, image: p.images[0], channels: p.channels,
                })) : [{ key: p.id, name: p.name, variant: "—", sku: p.sku, price: p.price, stock: p.stock, brand: p.brand.name, image: p.images[0], channels: p.channels }];
                return rows;
              }).map((r) => (
                <tr key={r.key} className="hover:bg-muted/20">
                  <td className="p-3"><input type="checkbox" /></td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={r.image} alt="" className="h-9 w-9 object-cover border" />
                      <span className="font-medium">{r.name}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-xs">{r.sku}</td>
                  <td className="p-3">{r.brand}</td>
                  <td className="p-3 text-muted-foreground">{r.variant}</td>
                  <td className="p-3 text-right font-semibold">{formatTRY(r.price)}</td>
                  <td className="p-3 text-right">
                    <span className={r.stock === 0 ? "text-destructive font-bold" : r.stock < 10 ? "text-warning font-bold" : "font-semibold"}>{r.stock}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {r.channels.map((c) => (
                        <span key={c} className="text-[10px] font-bold uppercase px-1.5 py-0.5 border"
                          style={{ color: `var(--channel-${c.toLowerCase()})`, borderColor: `color-mix(in oklab, var(--channel-${c.toLowerCase()}) 40%, transparent)` }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3"><button className="p-1 hover:bg-muted"><MoreVertical className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
