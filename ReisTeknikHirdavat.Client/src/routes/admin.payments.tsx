import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, CheckCircle2, XCircle, RefreshCcw, Percent } from "lucide-react";
import { paymentConfigs, installmentRows, txLogs, formatTRY } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { PaymentGatewayConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({ meta: [{ title: "Ödeme Ayarları — Reis Teknik Yönetim" }] }),
  component: Payments,
});

function Payments() {
  const [configs, setConfigs] = useState<PaymentGatewayConfig[]>(paymentConfigs);
  const update = (gw: PaymentGatewayConfig["gateway"], patch: Partial<PaymentGatewayConfig>) =>
    setConfigs((cs) => cs.map((c) => (c.gateway === gw ? { ...c, ...patch } : c)));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight">Ödeme Yapılandırması</h1>
        <p className="text-sm text-muted-foreground">Gateway entegrasyonu, taksit oranları ve işlem logları</p>
      </div>

      <Tabs defaultValue="gateways">
        <TabsList className="bg-muted h-auto p-1 rounded-none">
          <TabsTrigger value="gateways" className="rounded-none data-[state=active]:bg-amber-brand data-[state=active]:text-amber-brand-foreground"><CreditCard className="h-4 w-4 mr-2" />Gateway'ler</TabsTrigger>
          <TabsTrigger value="installments" className="rounded-none data-[state=active]:bg-amber-brand data-[state=active]:text-amber-brand-foreground"><Percent className="h-4 w-4 mr-2" />Taksit Oranları</TabsTrigger>
          <TabsTrigger value="logs" className="rounded-none data-[state=active]:bg-amber-brand data-[state=active]:text-amber-brand-foreground"><RefreshCcw className="h-4 w-4 mr-2" />İşlem Logları</TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="mt-5 grid gap-5 lg:grid-cols-2">
          {configs.map((c) => (
            <div key={c.gateway} className="border bg-card">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 grid place-items-center font-display font-bold text-sm",
                    c.gateway === "iyzico" ? "bg-info text-white" : "bg-amber-brand text-amber-brand-foreground")}>
                    {c.gateway === "iyzico" ? "iyz" : "PTR"}
                  </div>
                  <div>
                    <div className="font-display font-bold uppercase">{c.gateway}</div>
                    <div className="text-xs text-muted-foreground">{c.active ? "Aktif" : "Devre dışı"}{c.testMode && " · Test modu"}</div>
                  </div>
                </div>
                <Switch checked={c.active} onCheckedChange={(v) => update(c.gateway, { active: v })} />
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Merchant ID</Label>
                  <Input value={c.merchantId} onChange={(e) => update(c.gateway, { merchantId: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">API Key</Label>
                  <Input value={c.apiKey} onChange={(e) => update(c.gateway, { apiKey: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">API Secret</Label>
                  <Input type="password" value={c.apiSecret} onChange={(e) => update(c.gateway, { apiSecret: e.target.value })} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={c.testMode} onCheckedChange={(v) => update(c.gateway, { testMode: v })} />
                  <span>Test (Sandbox) modu</span>
                </label>
                <Button onClick={() => toast.success(`${c.gateway} ayarları kaydedildi`)} className="w-full bg-amber-brand text-amber-brand-foreground hover:bg-amber-brand/90 rounded-none uppercase">
                  Kaydet ve Doğrula
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="installments" className="mt-5">
          <div className="border bg-card">
            <div className="border-b p-3 bg-muted/40 flex items-center justify-between">
              <div>
                <div className="font-display text-sm font-bold uppercase">Banka Bazlı Taksit Oranları</div>
                <div className="text-xs text-muted-foreground">Sepet ödemesinde gösterilen oranlar</div>
              </div>
              <Button size="sm" className="bg-amber-brand text-amber-brand-foreground hover:bg-amber-brand/90 rounded-none">Yeni Satır</Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left p-3 font-semibold">Banka</th><th className="text-right p-3 font-semibold">Taksit Sayısı</th><th className="text-right p-3 font-semibold">Komisyon Oranı</th><th className="text-right p-3 font-semibold">Örnek (1.000₺)</th><th className="p-3" /></tr>
              </thead>
              <tbody className="divide-y">
                {installmentRows.map((r, i) => (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="p-3 font-medium">{r.bank}</td>
                    <td className="p-3 text-right font-mono">{r.installments}x</td>
                    <td className="p-3 text-right font-mono">{r.rate.toFixed(1)}%</td>
                    <td className="p-3 text-right text-muted-foreground">{formatTRY((1000 * (1 + r.rate / 100)) / r.installments)} / ay</td>
                    <td className="p-3 text-right"><Button variant="ghost" size="sm">Düzenle</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-5">
          <div className="border bg-card">
            <div className="border-b p-3 bg-muted/40">
              <div className="font-display text-sm font-bold uppercase">İşlem Logları</div>
              <div className="text-xs text-muted-foreground">Son 7 gün</div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left p-3 font-semibold">İşlem ID</th><th className="text-left p-3 font-semibold">Gateway</th><th className="text-left p-3 font-semibold">Sipariş</th><th className="text-right p-3 font-semibold">Tutar</th><th className="text-left p-3 font-semibold">Durum</th><th className="text-left p-3 font-semibold">Tarih</th></tr>
              </thead>
              <tbody className="divide-y">
                {txLogs.map((t) => {
                  const Icon = t.status === "Success" ? CheckCircle2 : t.status === "Failed" ? XCircle : RefreshCcw;
                  const color = t.status === "Success" ? "text-success" : t.status === "Failed" ? "text-destructive" : "text-warning";
                  return (
                    <tr key={t.id} className="hover:bg-muted/20">
                      <td className="p-3 font-mono text-xs">{t.id.toUpperCase()}</td>
                      <td className="p-3 font-semibold">{t.gateway}</td>
                      <td className="p-3 font-mono text-xs">{t.orderNumber}</td>
                      <td className="p-3 text-right font-semibold">{formatTRY(t.amount)}</td>
                      <td className="p-3"><span className={cn("inline-flex items-center gap-1 text-xs font-semibold", color)}><Icon className="h-3.5 w-3.5" />{t.status}</span></td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString("tr-TR")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
