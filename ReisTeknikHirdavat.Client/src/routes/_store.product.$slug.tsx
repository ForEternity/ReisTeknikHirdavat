import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, ShoppingCart, ShieldCheck, Truck, Minus, Plus, Star } from "lucide-react";
import { products, formatTRY } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_store/product/$slug")({
  loader: ({ params }) => {
    const product = products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.name} — Reis Teknik` },
      { name: "description", content: loaderData?.product.shortDescription ?? "" },
      { property: "og:image", content: loaderData?.product.images[0] },
    ],
  }),
  notFoundComponent: () => <div className="container mx-auto p-12 text-center">Ürün bulunamadı.</div>,
  errorComponent: () => <div className="container mx-auto p-12 text-center">Bir hata oluştu.</div>,
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [variant, setVariant] = useState(product.variants[0]);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const price = variant?.price ?? product.price;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-xs text-muted-foreground mb-6">
        <Link to="/" className="hover:text-amber-brand">Anasayfa</Link> /{" "}
        <Link to="/catalog" className="hover:text-amber-brand">{product.category.name}</Link> /{" "}
        <span className="text-foreground">{product.name}</span>
      </nav>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden border bg-muted">
            <img src={product.images[imgIdx]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {product.images.map((src: string, i: number) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={cn("aspect-square overflow-hidden border-2", i === imgIdx ? "border-amber-brand" : "border-transparent")}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-amber-brand">{product.brand.name}</div>
          <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight">{product.name}</h1>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("h-4 w-4", i < Math.round(product.rating) ? "fill-amber-brand text-amber-brand" : "text-muted-foreground")} />
              ))}
              <span className="ml-1 text-muted-foreground">({product.reviewCount} değerlendirme)</span>
            </div>
            <span className="font-mono text-xs text-muted-foreground">SKU: {product.sku}</span>
          </div>
          <p className="mt-5 text-muted-foreground">{product.shortDescription}</p>

          <div className="mt-6 border-t border-b py-5">
            <div className="flex items-baseline gap-3">
              {product.listPrice && (
                <span className="text-sm text-muted-foreground line-through">{formatTRY(product.listPrice)}</span>
              )}
              <span className="font-display text-4xl font-bold">{formatTRY(price)}</span>
              <span className="text-xs text-muted-foreground">KDV dahil</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              veya <span className="font-semibold text-foreground">9 x {formatTRY(price / 9)}</span> taksitle
            </div>
          </div>

          {product.variants.length > 0 && (
            <div className="mt-5">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Varyant</div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: typeof product.variants[number]) => (
                  <button key={v.id} onClick={() => setVariant(v)}
                    className={cn("border px-4 py-2 text-sm font-medium transition-colors",
                      variant?.id === v.id ? "border-amber-brand bg-amber-brand/10 text-foreground"
                        : "border-border hover:border-amber-brand")}>
                    {v.name}
                    <span className="ml-2 text-xs text-muted-foreground">{v.stock} stok</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center gap-3 text-sm">
            {product.inStock ? (
              <span className="flex items-center gap-1 text-success font-medium"><Check className="h-4 w-4" />Stokta · {variant?.stock ?? product.stock} adet</span>
            ) : (
              <span className="flex items-center gap-1 text-destructive font-medium"><X className="h-4 w-4" />Stokta yok</span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-11 w-11 grid place-items-center hover:bg-muted"><Minus className="h-4 w-4" /></button>
              <div className="h-11 w-12 grid place-items-center font-mono font-semibold border-x">{qty}</div>
              <button onClick={() => setQty((q) => q + 1)} className="h-11 w-11 grid place-items-center hover:bg-muted"><Plus className="h-4 w-4" /></button>
            </div>
            <Button size="lg" disabled={!product.inStock} onClick={() => add(product, variant, qty)}
              className="flex-1 min-w-[200px] bg-amber-brand text-amber-brand-foreground hover:bg-amber-brand/90 rounded-none uppercase h-11">
              <ShoppingCart className="h-5 w-5" />Sepete Ekle
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 border p-3"><Truck className="h-4 w-4 text-amber-brand" />Aynı gün kargo</div>
            <div className="flex items-center gap-2 border p-3"><ShieldCheck className="h-4 w-4 text-amber-brand" />2 yıl garanti</div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-display text-xl font-bold uppercase border-b pb-2">Ürün Açıklaması</h2>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{product.description}</p>
        </div>
        <div>
          <h2 className="font-display text-xl font-bold uppercase border-b pb-2">Teknik Bilgi</h2>
          <dl className="mt-4 text-sm divide-y border">
            {[
              ["Marka", product.brand.name],
              ["Kategori", product.category.name],
              ["SKU", product.sku],
              ["Stok", String(product.stock)],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-2 px-3 py-2">
                <dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
