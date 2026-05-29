import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { brands, products, formatTRY } from "@/lib/mock-data";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_store/catalog")({
  head: () => ({ meta: [{ title: "Ürün Kataloğu — Reis Teknik" }, { name: "description", content: "Tüm endüstriyel hırdavat ürünleri." }] }),
  component: Catalog,
});

function Catalog() {
  const max = Math.max(...products.map((p) => p.price));
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [range, setRange] = useState<[number, number]>([0, max]);
  const [onlyStock, setOnlyStock] = useState(false);
  const [onlyVariants, setOnlyVariants] = useState(false);

  const filtered = useMemo(() => products.filter((p) => {
    if (selectedBrands.length && !selectedBrands.includes(p.brand.id)) return false;
    if (p.price < range[0] || p.price > range[1]) return false;
    if (onlyStock && !p.inStock) return false;
    if (onlyVariants && p.variants.length === 0) return false;
    return true;
  }), [selectedBrands, range, onlyStock, onlyVariants]);

  const toggleBrand = (id: string) =>
    setSelectedBrands((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 border-b pb-4">
        <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight">Ürün Kataloğu</h1>
        <p className="text-sm text-muted-foreground mt-1">{filtered.length} ürün listeleniyor</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <div className="border bg-card">
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2 font-display uppercase text-sm font-bold">
              <SlidersHorizontal className="h-4 w-4 text-amber-brand" /> Filtreler
            </div>
            <div className="p-4 space-y-5">
              <FilterBlock title="Marka">
                <div className="space-y-2">
                  {brands.map((b) => (
                    <label key={b.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={selectedBrands.includes(b.id)} onCheckedChange={() => toggleBrand(b.id)} />
                      {b.name}
                    </label>
                  ))}
                </div>
              </FilterBlock>
              <FilterBlock title="Fiyat Aralığı">
                <Slider value={range} onValueChange={(v) => setRange([v[0], v[1]] as [number, number])} min={0} max={max} step={100} />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground font-mono">
                  <span>{formatTRY(range[0])}</span><span>{formatTRY(range[1])}</span>
                </div>
              </FilterBlock>
              <FilterBlock title="Durum">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={onlyStock} onCheckedChange={(v) => setOnlyStock(!!v)} />Sadece stoktakiler
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer mt-2">
                  <Checkbox checked={onlyVariants} onCheckedChange={(v) => setOnlyVariants(!!v)} />Varyantlı ürünler
                </label>
              </FilterBlock>
            </div>
          </div>
        </aside>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 self-start">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          {filtered.length === 0 && (
            <div className="col-span-full border border-dashed p-12 text-center text-muted-foreground">
              Kriterlere uygun ürün bulunamadı.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
