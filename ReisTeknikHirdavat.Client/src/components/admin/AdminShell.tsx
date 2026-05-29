import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, Package, ShoppingBag, CreditCard, Wrench,
  Bell, Search, ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/inventory", label: "Envanter", icon: Package },
  { to: "/admin/orders", label: "Siparişler", icon: ShoppingBag },
  { to: "/admin/payments", label: "Ödeme Ayarları", icon: CreditCard },
];

export function AdminShell() {
  const loc = useLocation();
  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-60 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-2 h-16 px-4 border-b border-sidebar-border">
          <div className="flex h-8 w-8 items-center justify-center bg-amber-brand text-amber-brand-foreground">
            <Wrench className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display text-sm font-bold uppercase leading-none">ReisTeknik</div>
            <div className="text-[10px] uppercase tracking-widest opacity-60 mt-0.5">Yönetim Paneli</div>
          </div>
        </Link>
        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {nav.map((item) => {
            const active = item.end ? loc.pathname === item.to : loc.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-amber-brand text-amber-brand-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}>
                <item.icon className="h-4 w-4" />{item.label}
              </Link>
            );
          })}
        </nav>
        <Link to="/" className="m-2 flex items-center gap-2 rounded-sm px-3 py-2 text-xs text-sidebar-foreground/60 hover:text-amber-brand">
          <ArrowUpRight className="h-3 w-3" />Mağazaya Dön
        </Link>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background flex items-center px-6 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Sipariş, ürün, müşteri ara..." className="pl-9 h-9 bg-muted/50 border-0" />
          </div>
          <button className="relative rounded-sm border p-2 hover:bg-muted">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-brand" />
          </button>
          <div className="flex items-center gap-2 border-l pl-4">
            <div className="h-8 w-8 rounded-full bg-steel text-steel-foreground grid place-items-center text-xs font-bold">RT</div>
            <div className="text-xs leading-tight">
              <div className="font-semibold">Operasyon</div>
              <div className="text-muted-foreground">admin@reisteknik.com</div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}
