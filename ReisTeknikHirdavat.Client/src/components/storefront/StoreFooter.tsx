import { Wrench, ShieldCheck, Truck, CreditCard } from "lucide-react";

export function StoreFooter() {
  return (
    <footer className="mt-20 border-t bg-steel text-steel-foreground">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center bg-amber-brand text-amber-brand-foreground">
              <Wrench className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-bold uppercase">ReisTeknik</span>
          </div>
          <p className="text-sm opacity-70">1998'den bu yana endüstriyel hırdavat ve profesyonel iş güvenliği çözümleri.</p>
        </div>
        <div>
          <h4 className="font-display text-sm font-bold uppercase mb-3">Kurumsal</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>Hakkımızda</li><li>Bayilik</li><li>İletişim</li><li>Kariyer</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-bold uppercase mb-3">Müşteri Hizmetleri</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>Kargo & Teslimat</li><li>İade & Değişim</li><li>KVKK Aydınlatma Metni</li><li>Mesafeli Satış Sözleşmesi</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-bold uppercase mb-3">Avantajlar</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-amber-brand" />2.500₺ üzeri ücretsiz kargo</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-brand" />Orijinal ürün garantisi</li>
            <li className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-amber-brand" />9 taksit imkânı</li>
          </ul>
        </div>
      </div>
      <div className="hazard-stripe h-2" />
      <div className="container mx-auto px-4 py-4 text-xs opacity-60">
        © 2026 Reis Teknik Hırdavat A.Ş. · Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
