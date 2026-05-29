import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ArrowRight, Minus, Plus } from "lucide-react";
import { useCart, cartKey } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { formatTRY } from "@/lib/mock-data";

export const Route = createFileRoute("/_store/cart")({
  head: () => ({ meta: [{ title: "Sepet — Reis Teknik" }] }),
  component: CartPage,
});

function CartPage() {
  const { lines, setQty, remove, subtotal } = useCart();
  const shipping = subtotal >= 2500 || subtotal === 0 ? 0 : 89;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight border-b pb-3">Sepetim</h1>
      {lines.length === 0 ? (
        <div className="mt-12 border border-dashed p-12 text-center">
          <p className="text-muted-foreground">Sepetiniz boş.</p>
          <Button asChild className="mt-4 bg-amber-brand text-amber-brand-foreground hover:bg-amber-brand/90 rounded-none">
            <Link to="/catalog">Alışverişe Başla</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="border bg-card divide-y">
            {lines.map((l) => {
              const k = cartKey(l);
              return (
                <div key={k} className="flex gap-4 p-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden bg-muted">
                    {l.image && <img src={l.image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{l.name}</div>
                    <div className="font-mono text-xs text-muted-foreground mt-0.5">{l.sku}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border">
                        <button onClick={() => setQty(k, l.quantity - 1)} className="h-8 w-8 grid place-items-center hover:bg-muted"><Minus className="h-3 w-3" /></button>
                        <div className="h-8 w-10 grid place-items-center font-mono text-sm border-x">{l.quantity}</div>
                        <button onClick={() => setQty(k, l.quantity + 1)} className="h-8 w-8 grid place-items-center hover:bg-muted"><Plus className="h-3 w-3" /></button>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-bold">{formatTRY(l.unitPrice * l.quantity)}</div>
                        <div className="text-xs text-muted-foreground">{formatTRY(l.unitPrice)} / adet</div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => remove(k)} className="text-muted-foreground hover:text-destructive self-start"><Trash2 className="h-4 w-4" /></button>
                </div>
              );
            })}
          </div>
          <aside className="border bg-card p-5 h-fit sticky top-28">
            <h2 className="font-display text-lg font-bold uppercase border-b pb-2">Sipariş Özeti</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt>Ara Toplam</dt><dd>{formatTRY(subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Kargo</dt><dd>{shipping === 0 ? <span className="text-success font-semibold">Ücretsiz</span> : formatTRY(shipping)}</dd></div>
              {shipping > 0 && (
                <div className="text-xs text-muted-foreground">
                  {formatTRY(2500 - subtotal)} daha ekleyerek ücretsiz kargo kazanın
                </div>
              )}
            </dl>
            <div className="mt-4 flex justify-between border-t pt-4">
              <span className="font-display text-lg font-bold uppercase">Toplam</span>
              <span className="font-display text-2xl font-bold">{formatTRY(total)}</span>
            </div>
            <Button asChild size="lg" className="mt-5 w-full bg-amber-brand text-amber-brand-foreground hover:bg-amber-brand/90 rounded-none uppercase">
              <Link to="/checkout">Ödemeye Geç <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
