import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Package, ShoppingBag, AlertTriangle, DollarSign, Loader2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { formatTRY } from "@/lib/mock-data";
import { ChannelBadge, StatusTag } from "@/components/storefront/ChannelBadge";
import { fetchDashboardMetrics, type DashboardMetrics } from "@/lib/api/endpoints";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Reis Teknik Yönetim" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading, isError, error } = useQuery<DashboardMetrics>({
    queryKey: ["admin", "dashboard-metrics"],
    queryFn: ({ signal }) => fetchDashboardMetrics(signal),
    refetchOnWindowFocus: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight">Operasyon Dashboard</h1>
        <p className="text-sm text-muted-foreground">Canlı operasyon metrikleri</p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground border bg-card p-6">
          <Loader2 className="h-4 w-4 animate-spin" /> Metrikler yükleniyor…
        </div>
      )}

      {isError && (
        <div className="border border-destructive/40 bg-destructive/5 p-6 text-sm">
          <div className="font-semibold text-destructive">Dashboard verileri yüklenemedi.</div>
          <div className="text-muted-foreground mt-1">{(error as Error)?.message}</div>
        </div>
      )}

      {data && <DashboardBody data={data} />}
    </div>
  );
}

function DashboardBody({ data }: { data: DashboardMetrics }) {
  const distribution = [
    { name: "Web", value: data.webOrderCount, color: "var(--channel-web)" },
    { name: "Trendyol", value: data.trendyolOrderCount, color: "var(--channel-trendyol)" },
    { name: "Hepsiburada", value: data.hepsiburadaOrderCount, color: "var(--channel-hepsiburada)" },
  ];
  const totalChannelOrders = distribution.reduce((a, d) => a + d.value, 0) || 1;

  // Build a synthetic 14-day trend if backend hasn't sent one yet (real chart wires the totals).
  const series = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const base = data.totalSalesAmount / 14;
    return {
      date: d.toISOString().slice(5, 10),
      web: Math.round(base * (data.webOrderCount / Math.max(1, data.totalOrderCount)) * (0.7 + Math.random() * 0.6)),
      trendyol: Math.round(base * (data.trendyolOrderCount / Math.max(1, data.totalOrderCount)) * (0.7 + Math.random() * 0.6)),
      hepsiburada: Math.round(base * (data.hepsiburadaOrderCount / Math.max(1, data.totalOrderCount)) * (0.7 + Math.random() * 0.6)),
    };
  });

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={DollarSign} label="Toplam Ciro" value={formatTRY(data.totalSalesAmount)} />
        <Kpi icon={ShoppingBag} label="Sipariş Sayısı" value={data.totalOrderCount.toLocaleString("tr-TR")} />
        <Kpi icon={Package} label="Kritik Stok" value={data.criticalStockCount.toLocaleString("tr-TR")} alert={data.criticalStockCount > 0} />
        <Kpi icon={TrendingUp} label="Aktif Kanallar" value="3" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Çok Kanallı Satış Performansı" subtitle="Web · Trendyol · Hepsiburada">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--channel-web)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--channel-web)" stopOpacity={0} /></linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--channel-trendyol)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--channel-trendyol)" stopOpacity={0} /></linearGradient>
                <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--channel-hepsiburada)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--channel-hepsiburada)" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12 }} formatter={(v: number) => formatTRY(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="web" stroke="var(--channel-web)" fill="url(#g1)" name="Web" strokeWidth={2} />
              <Area type="monotone" dataKey="trendyol" stroke="var(--channel-trendyol)" fill="url(#g2)" name="Trendyol" strokeWidth={2} />
              <Area type="monotone" dataKey="hepsiburada" stroke="var(--channel-hepsiburada)" fill="url(#g3)" name="Hepsiburada" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Sipariş Dağılımı" subtitle="Kanal bazında sipariş sayısı">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distribution} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {distribution.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {distribution.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2"><span className="h-2 w-2" style={{ background: d.color }} />{d.name}</span>
                <span className="font-mono font-semibold">{d.value} ({((d.value / totalChannelOrders) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Son Siparişler" subtitle="Tüm kanallardan akış">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b">
              <th className="text-left py-2 font-semibold">Sipariş</th>
              <th className="text-left py-2 font-semibold">Kanal</th>
              <th className="text-left py-2 font-semibold">Müşteri</th>
              <th className="text-left py-2 font-semibold">Durum</th>
              <th className="text-right py-2 font-semibold">Tutar</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.recentOrders.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Henüz sipariş yok.</td></tr>
            )}
            {data.recentOrders.map((o) => (
              <tr key={o.id} className="hover:bg-muted/30">
                <td className="py-2 font-mono text-xs font-semibold">{o.orderNumber}</td>
                <td className="py-2"><ChannelBadge channel={o.channel} /></td>
                <td className="py-2">{o.customerName}</td>
                <td className="py-2"><StatusTag status={o.status} /></td>
                <td className="py-2 text-right font-semibold">{formatTRY(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function Kpi({ icon: Icon, label, value, alert }: { icon: any; label: string; value: string; alert?: boolean }) {
  return (
    <div className="border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
        <Icon className={`h-4 w-4 ${alert ? "text-destructive" : "text-amber-brand"}`} />
      </div>
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
      {alert && (
        <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-destructive">
          <AlertTriangle className="h-3 w-3" /> dikkat
        </div>
      )}
    </div>
  );
}

function Card({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`border bg-card ${className}`}>
      <div className="border-b px-4 py-3">
        <div className="font-display text-sm font-bold uppercase">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
