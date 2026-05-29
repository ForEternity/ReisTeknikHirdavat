import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Truck, ShieldCheck, Wrench, Zap, HardHat, Drill } from "lucide-react";
import { products, brands, categories, formatTRY } from "@/lib/mock-data";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_store/")({
  head: () => ({
    meta: [
      { title: "Reis Teknik Hırdavat — Endüstriyel El Aletleri ve İş Güvenliği" },
      { name: "description", content: "Profesyonel elektrikli el aletleri, bağlantı elemanları, iş güvenliği ekipmanları. Bosch, Makita, DeWalt, Hilti, Karcher orijinal ürün garantisi." },
    ],
  }),
  component: Home,
});

const catIcons = [Drill, Wrench, HardHat, Wrench, Zap, Wrench];

function Home() {
  const featured = products.slice(0, 8);
  return (
    <div className="space-y-16 pb-16">
      {/* HERO */}
      <section className="relative overflow-hidden bg-steel text-steel-foreground">
        <div className="industrial-grid absolute inset-0 opacity-30" />
        <div className="container mx-auto relative grid gap-8 px-4 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 border border-amber-brand/40 bg-amber-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-brand animate-pulse" />
              Bahar Kampanyası · %25'e varan indirim
            </div>
            <h1 className="mt-5 font-display text-5xl md:text-6xl lg:text-7xl font-bold uppercase leading-[0.95] tracking-tight">
              Sahanın <span className="text-amber-brand">Dilini</span><br />Konuşan Hırdavat
            </h1>
            <p className="mt-5 max-w-lg text-base md:text-lg opacity-80">
              1998'den bu yana inşaat sahalarına, fabrikalara ve atölyelere profesyonel hırdavat tedarik ediyoruz. 12.000+ kalem ürün, aynı gün kargo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-amber-brand text-amber-brand-foreground hover:bg-amber-brand/90 rounded-none uppercase font-semibold tracking-wide">
                <Link to="/catalog">Kataloğu Keşfet <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-none border-steel-foreground/30 bg-transparent hover:bg-steel-foreground/10 text-steel-foreground uppercase tracking-wide">
                <Link to="/catalog">B2B Bayilik</Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { v: "12K+", l: "SKU" },
                { v: "98%", l: "Stoktan" },
                { v: "24sa", l: "Kargo" },
              ].map((s) => (
                <div key={s.l} className="border-l-2 border-amber-brand pl-3">
                  <div className="font-display text-2xl font-bold">{s.v}</div>
                  <div className="text-xs uppercase tracking-wider opacity-60">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="aspect-[4/5] overflow-hidden border-4 border-amber-brand">
              <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=70"
                alt="Endüstriyel atölyede profesyonel hırdavat" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-amber-brand text-amber-brand-foreground p-5 max-w-[220px]">
              <div className="font-display text-3xl font-bold leading-none">EN397</div>
              <div className="mt-1 text-xs uppercase tracking-wider font-semibold">CE Sertifikalı İş Güvenliği Ekipmanları</div>
            </div>
          </div>
        </div>
        <div className="hazard-stripe h-2" />
      </section>

      {/* KPI Strip */}
      <section className="container mx-auto px-4">
        <div className="grid gap-px bg-border md:grid-cols-4 border">
          {[
            { i: Truck, t: "2.500₺ üzeri ücretsiz kargo", s: "Türkiye genelinde" },
            { i: ShieldCheck, t: "Orijinal ürün garantisi", s: "Yetkili distribütör" },
            { i: Zap, t: "Aynı gün sevkiyat", s: "15:00'a kadar siparişler" },
            { i: Wrench, t: "Teknik servis desteği", s: "Yetkili usta ağı" },
          ].map((b) => (
            <div key={b.t} className="bg-card p-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-amber-brand/15 text-amber-brand"><b.i className="h-5 w-5" /></div>
              <div>
                <div className="text-sm font-semibold">{b.t}</div>
                <div className="text-xs text-muted-foreground">{b.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <SectionHead title="Kategoriler" sub="Sahanın ihtiyacına göre tasnif edilmiş ürün grupları" />
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((c, i) => {
            const Icon = catIcons[i % catIcons.length];
            return (
              <Link key={c.id} to="/catalog"
                className="group flex flex-col items-start gap-3 border bg-card p-4 transition-colors hover:border-amber-brand">
                <div className="flex h-10 w-10 items-center justify-center bg-muted text-steel group-hover:bg-amber-brand group-hover:text-amber-brand-foreground transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold leading-tight">{c.name}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4">
        <SectionHead title="Sahada Test Edilmiş" sub="En çok tercih edilen profesyonel ürünler" cta={<Link to="/catalog" className="text-sm font-semibold text-amber-brand hover:underline inline-flex items-center gap-1">Tümü <ArrowRight className="h-3 w-3" /></Link>} />
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Brands */}
      <section className="container mx-auto px-4">
        <SectionHead title="Yetkili Distribütör Olduğumuz Markalar" />
        <div className="mt-6 grid grid-cols-3 md:grid-cols-6 gap-px bg-border border">
          {brands.map((b) => (
            <div key={b.id} className="bg-card aspect-[3/2] grid place-items-center font-display font-bold uppercase text-lg text-steel hover:text-amber-brand transition-colors">
              {b.name}
            </div>
          ))}
        </div>
      </section>

      {/* B2B CTA */}
      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden bg-steel text-steel-foreground p-8 md:p-12">
          <div className="industrial-grid absolute inset-0 opacity-20" />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="text-xs uppercase tracking-widest text-amber-brand font-bold">Kurumsal Müşteriler</div>
              <h3 className="mt-2 font-display text-3xl md:text-4xl font-bold uppercase">Şantiye Hesabınızı Açın</h3>
              <p className="mt-3 max-w-xl opacity-80 text-sm md:text-base">
                Cari hesap, e-fatura entegrasyonu, vadeli ödeme ve özel B2B fiyatlandırma. Aylık ciro yapan firmalara özel anlaşma.
              </p>
            </div>
            <Button size="lg" className="bg-amber-brand text-amber-brand-foreground hover:bg-amber-brand/90 rounded-none uppercase">
              Bayilik Başvurusu <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHead({ title, sub, cta }: { title: string; sub?: string; cta?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b pb-3">
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight">{title}</h2>
        {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
      </div>
      {cta}
    </div>
  );
}
