import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, User, Phone, Truck, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

export function StoreHeader() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="bg-steel text-steel-foreground text-xs">
        <div className="container mx-auto flex h-8 items-center justify-between px-4">
          <div className="flex items-center gap-4 opacity-80">
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />0850 000 00 00</span>
            <span className="hidden sm:flex items-center gap-1"><Truck className="h-3 w-3" />2.500₺ üzeri kargo bedava</span>
          </div>
          <div className="flex items-center gap-3 opacity-80">
            <Link to="/account" className="hover:text-amber-brand">Hesabım</Link>
            <span>|</span>
            <Link to="/admin" className="hover:text-amber-brand">Yönetim Paneli</Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto flex h-16 items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center bg-amber-brand text-amber-brand-foreground">
            <Wrench className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div className="font-display text-xl font-bold uppercase tracking-tight">
            Reis<span className="text-amber-brand">Teknik</span>
          </div>
        </Link>
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Ürün, marka veya SKU ara..." className="pl-9 h-10" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild><Link to="/account"><User className="h-5 w-5" /></Link></Button>
          <Button variant="ghost" asChild className="relative">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Sepet</span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-brand px-1 text-[10px] font-bold text-amber-brand-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
      <nav className="border-t bg-muted/40">
        <div className="container mx-auto flex h-10 items-center gap-6 px-4 overflow-x-auto text-sm font-medium">
          {["Elektrikli Aletler","Bağlantı Elemanları","İş Güvenliği","El Aletleri","Ölçü & Kontrol","Kesici Takımlar","Kampanyalar"].map((c) => (
            <Link key={c} to="/catalog" className="whitespace-nowrap text-muted-foreground hover:text-amber-brand">{c}</Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
