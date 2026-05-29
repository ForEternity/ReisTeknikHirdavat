import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package, Truck, MapPin, Building2, User } from "lucide-react";
import { orders, formatTRY } from "@/lib/mock-data";
import { StatusTag, ChannelBadge } from "@/components/storefront/ChannelBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { CorporateInvoiceProfile } from "@/lib/types";

export const Route = createFileRoute("/_store/account")({
  head: () => ({ meta: [{ title: "Hesabım — Reis Teknik" }] }),
  component: AccountPage,
});

function AccountPage() {
  const [profile, setProfile] = useState<CorporateInvoiceProfile>({
    companyTitle: "Yılmaz İnşaat A.Ş.", taxOffice: "Beşiktaş", taxNumber: "1234567890", eInvoice: true,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="border-b pb-4 mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight">Hesabım</h1>
        <p className="text-sm text-muted-foreground mt-1">Hoş geldin, Mehmet Yılmaz · mehmet@yilmazinsaat.com</p>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="bg-muted h-auto p-1 rounded-none">
          <TabsTrigger value="orders" className="rounded-none data-[state=active]:bg-amber-brand data-[state=active]:text-amber-brand-foreground"><Package className="h-4 w-4 mr-2" />Siparişlerim</TabsTrigger>
          <TabsTrigger value="tracking" className="rounded-none data-[state=active]:bg-amber-brand data-[state=active]:text-amber-brand-foreground"><Truck className="h-4 w-4 mr-2" />Kargo Takibi</TabsTrigger>
          <TabsTrigger value="invoice" className="rounded-none data-[state=active]:bg-amber-brand data-[state=active]:text-amber-brand-foreground"><Building2 className="h-4 w-4 mr-2" />Kurumsal Fatura</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-none data-[state=active]:bg-amber-brand data-[state=active]:text-amber-brand-foreground"><User className="h-4 w-4 mr-2" />Profil</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-5">
          <div className="border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left p-3">Sipariş No</th><th className="text-left p-3">Tarih</th><th className="text-left p-3">Kanal</th><th className="text-left p-3">Durum</th><th className="text-right p-3">Tutar</th><th className="p-3" /></tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs font-semibold">{o.orderNumber}</td>
                    <td className="p-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td className="p-3"><ChannelBadge channel={o.channel} /></td>
                    <td className="p-3"><StatusTag status={o.status} /></td>
                    <td className="p-3 text-right font-semibold">{formatTRY(o.total)}</td>
                    <td className="p-3 text-right"><Button variant="ghost" size="sm">Detay</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="mt-5 space-y-4">
          {orders.filter((o) => o.status === "Shipped" || o.status === "Delivered").map((o) => (
            <div key={o.id} className="border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-xs text-muted-foreground">{o.orderNumber}</div>
                  <div className="font-semibold mt-1">{o.carrier} · {o.trackingNumber}</div>
                  <div className="text-sm text-muted-foreground">{o.itemCount} ürün · {formatTRY(o.total)}</div>
                </div>
                <StatusTag status={o.status} />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {["Hazırlanıyor", "Kargoda", "Dağıtımda", "Teslim Edildi"].map((step, i) => {
                  const reached = (o.status === "Shipped" && i <= 1) || (o.status === "Delivered" && i <= 3);
                  return (
                    <div key={step} className="relative">
                      <div className={`h-1 ${reached ? "bg-amber-brand" : "bg-muted"}`} />
                      <div className={`mt-2 text-xs ${reached ? "font-semibold" : "text-muted-foreground"}`}>{step}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="invoice" className="mt-5">
          <div className="border bg-card p-6 max-w-2xl">
            <h2 className="font-display text-lg font-bold uppercase">Kurumsal Fatura Profili</h2>
            <p className="text-sm text-muted-foreground mt-1">Tüm siparişleriniz bu bilgilerle faturalandırılır.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold mb-1.5 block">Firma Ünvanı</Label>
                <Input value={profile.companyTitle} onChange={(e) => setProfile({ ...profile, companyTitle: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Vergi Dairesi</Label>
                <Input value={profile.taxOffice} onChange={(e) => setProfile({ ...profile, taxOffice: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Vergi / TC Numarası</Label>
                <Input value={profile.taxNumber} onChange={(e) => setProfile({ ...profile, taxNumber: e.target.value })} />
              </div>
              <label className="sm:col-span-2 flex items-center gap-2 text-sm">
                <Checkbox checked={profile.eInvoice} onCheckedChange={(v) => setProfile({ ...profile, eInvoice: !!v })} />
                E-Fatura mükellefiyim
              </label>
            </div>
            <Button onClick={() => toast.success("Fatura profili güncellendi")} className="mt-5 bg-amber-brand text-amber-brand-foreground hover:bg-amber-brand/90 rounded-none uppercase">
              Bilgileri Kaydet
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-5">
          <div className="border bg-card p-6 max-w-2xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label className="text-xs font-semibold mb-1.5 block">Ad Soyad</Label><Input defaultValue="Mehmet Yılmaz" /></div>
              <div><Label className="text-xs font-semibold mb-1.5 block">Telefon</Label><Input defaultValue="0532 000 00 00" /></div>
              <div className="sm:col-span-2"><Label className="text-xs font-semibold mb-1.5 block">E-posta</Label><Input defaultValue="mehmet@yilmazinsaat.com" /></div>
            </div>
            <div className="mt-5 border-t pt-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />Varsayılan teslimat adresi</div>
              <p className="mt-1 text-sm">Akatlar Mah. Zeytinoğlu Cad. No:12/4, Beşiktaş / İstanbul</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
