import { Link } from "@tanstack/react-router";
import { ShoppingCart, Check, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatTRY } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const discount = product.listPrice ? Math.round((1 - product.price / product.listPrice) * 100) : 0;
  return (
    <div className="group relative flex flex-col border bg-card transition-all hover:border-amber-brand hover:shadow-lg">
      {discount > 0 && (
        <div className="absolute left-0 top-3 z-10 bg-amber-brand px-2 py-0.5 text-xs font-bold text-amber-brand-foreground">
          %{discount}
        </div>
      )}
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block aspect-square overflow-hidden bg-muted">
        <img src={product.images[0]} alt={product.name} loading="lazy"
          className="h-full w-full object-cover transition-transform group-hover:scale-105" />
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{product.brand.name}</div>
        <Link to="/product/$slug" params={{ slug: product.slug }}
          className="mt-1 line-clamp-2 text-sm font-medium leading-snug hover:text-amber-brand">
          {product.name}
        </Link>
        <div className="mt-1 font-mono text-[11px] text-muted-foreground">{product.sku}</div>
        <div className="mt-2 flex items-center gap-1 text-xs">
          {product.inStock ? (
            <span className="flex items-center gap-1 text-success"><Check className="h-3 w-3" />Stokta {product.stock}</span>
          ) : (
            <span className="flex items-center gap-1 text-destructive"><X className="h-3 w-3" />Tükendi</span>
          )}
        </div>
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            {product.listPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatTRY(product.listPrice)}</span>
            )}
            <span className="font-display text-xl font-bold text-foreground">{formatTRY(product.price)}</span>
          </div>
          <Button onClick={() => add(product)} disabled={!product.inStock} size="sm"
            className="mt-2 w-full bg-amber-brand text-amber-brand-foreground hover:bg-amber-brand/90">
            <ShoppingCart className="h-4 w-4" />Sepete Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
