import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, FileText, ShieldCheck, CreditCard, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatTRY } from "@/lib/mock-data";
import { toast } from "sonner";
import type { CheckoutConsents } from "@/lib/types";
import { createOrder, type CreateOrderPayload } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/_store/checkout")({
  head: () => ({ meta: [{ title: "Ödeme — Reis Teknik" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [isCorporate, setIsCorporate] = useState(false);
  const [consents, setConsents] = useState<CheckoutConsents>({ kvkk: false, acikRiza: false, mesafeliSatis: false });
  const [gateway, setGateway] = useState<"iyzico" | "PayTR">("iyzico");
  const [submitting, setSubmitting] = useState(false);

  const allConsents = consents.kvkk && consents.acikRiza && consents.mesafeliSatis;
  const shipping = subtotal >= 2500 || subtotal === 0 ? 0 : 89;
  const total = subtotal + shipping;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allConsents) { toast.error("Lütfen tüm yasal onayları işaretleyin."); return; }
    if (lines.length === 0) { toast.error("Sepetiniz boş."); return; }

    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const g = (k: string) => String(fd.get(k) ?? "").trim();

    const payload: CreateOrderPayload = {
      address: {
        fullName: g("fullName"),
        phone: g("phone"),
        email: g("email"),
        city: g("city"),
        district: g("district"),
        postalCode: g("postalCode") || undefined,
        line1: g("line1"),
      },
      corporateInvoice: isCorporate ? {
        companyName: g("companyName"),
        taxOffice: g("taxOffice"),
        taxNumber: g("taxNumber"),
        eInvoice: fd.get("eInvoice") === "on",
      } : undefined,
      paymentGateway: gateway,
      items: lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        sku: l.sku,
        name: l.name,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
      })),
      kvkkApproved: true,
      mssApproved: true,
    };

    setSubmitting(true);
    try {
      const result = await createOrder(payload);
      toast.success(`Sipariş alındı: ${result.orderNumber}`);
      clear();
      if (result.paymentRedirectUrl) {
        window.location.href = result.paymentRedirectUrl;
        return;
      }
      navigate({ to: "/account" });
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight border-b pb-3">Ödeme</h1>
      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Section icon={FileText} title="1. Teslimat Bilgileri">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ad Soyad" required><Input name="fullName" placeholder="Mehmet Yılmaz" required /></Field>
              <Field label="Telefon" required><Input name="phone" placeholder="05XX XXX XX XX" required /></Field>
              <Field label="E-posta" required><Input name="email" type="email" required /></Field>
              <Field label="Şehir" required><Input name="city" required /></Field>
              <Field label="İlçe" required><Input name="district" required /></Field>
              <Field label="Posta Kodu"><Input name="postalCode" /></Field>
              <div className="sm:col-span-2"><Field label="Adres" required><Input name="line1" required /></Field></div>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <Checkbox checked={isCorporate} onCheckedChange={(v) => setIsCorporate(!!v)} />
              Kurumsal fatura istiyorum
            </label>
            {isCorporate && (
              <div className="mt-3 grid gap-4 sm:grid-cols-2 border-t pt-4">
                <Field label="Firma Ünvanı" required><Input name="companyName" required /></Field>
                <Field label="Vergi Dairesi" required><Input name="taxOffice" placeholder="Beşiktaş" required /></Field>
                <Field label="Vergi / TC Numarası" required><Input name="taxNumber" placeholder="1234567890" required /></Field>
                <label className="flex items-center gap-2 text-sm self-end pb-2">
                  <input type="checkbox" name="eInvoice" className="h-4 w-4" /> E-fatura mükellefiyim
                </label>
              </div>
            )}
          </Section>

          <Section icon={CreditCard} title="2. Ödeme Yöntemi">
            <RadioGroup value={gateway} onValueChange={(v) => setGateway(v as "iyzico" | "PayTR")} className="grid sm:grid-cols-2 gap-3">
              {(["iyzico", "PayTR"] as const).map((g) => (
                <label key={g} className="flex items-center gap-3 border p-4 cursor-pointer has-[:checked]:border-amber-brand has-[:checked]:bg-amber-brand/5">
                  <RadioGroupItem value={g} />
                  <div>
                    <div className="font-semibold">{g}</div>
                    <div className="text-xs text-muted-foreground">Kredi/Banka kartı · 9 taksit</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2"><Field label="Kart Üzerindeki İsim"><Input /></Field></div>
              <div className="sm:col-span-2"><Field label="Kart Numarası"><Input placeholder="•••• •••• •••• ••••" /></Field></div>
              <Field label="Son Kullanma"><Input placeholder="AA / YY" /></Field>
              <Field label="CVV"><Input placeholder="•••" /></Field>
            </div>
          </Section>

          <Section icon={ShieldCheck} title="3. Yasal Onaylar">
            <div className="space-y-3">
              <ConsentRow
                checked={consents.kvkk}
                onChange={(v) => setConsents((c) => ({ ...c, kvkk: v }))}
                title="KVKK Aydınlatma Metni"
                desc="Kişisel verilerimin işlenmesine ilişkin aydınlatma metnini okudum, anladım."
              />
              <ConsentRow
                checked={consents.acikRiza}
                onChange={(v) => setConsents((c) => ({ ...c, acikRiza: v }))}
                title="Açık Rıza Onayı"
                desc="Pazarlama amaçlı iletişim ve veri işlemeye açık rıza veriyorum."
              />
              <ConsentRow
                checked={consents.mesafeliSatis}
                onChange={(v) => setConsents((c) => ({ ...c, mesafeliSatis: v }))}
                title="Mesafeli Satış Sözleşmesi"
                desc="Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu'nu okudum, kabul ediyorum."
              />
            </div>
          </Section>
        </div>

        <aside className="border bg-card p-5 h-fit sticky top-28">
          <h2 className="font-display text-lg font-bold uppercase border-b pb-2">Sipariş Özeti</h2>
          <div className="mt-3 space-y-2 max-h-48 overflow-auto">
            {lines.map((l, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="truncate pr-2">{l.quantity}× {l.name}</span>
                <span className="font-mono">{formatTRY(l.unitPrice * l.quantity)}</span>
              </div>
            ))}
          </div>
          <dl className="mt-4 space-y-1.5 text-sm border-t pt-3">
            <div className="flex justify-between"><dt>Ara Toplam</dt><dd>{formatTRY(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Kargo</dt><dd>{shipping === 0 ? "Ücretsiz" : formatTRY(shipping)}</dd></div>
          </dl>
          <div className="mt-3 flex justify-between border-t pt-3">
            <span className="font-display font-bold uppercase">Toplam</span>
            <span className="font-display text-xl font-bold">{formatTRY(total)}</span>
          </div>
          <Button type="submit" size="lg" disabled={!allConsents || lines.length === 0 || submitting}
            className="mt-4 w-full bg-amber-brand text-amber-brand-foreground hover:bg-amber-brand/90 rounded-none uppercase">
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
            {submitting ? "Gönderiliyor..." : "Siparişi Tamamla"}
          </Button>
          <p className="mt-3 text-[11px] text-muted-foreground text-center">{gateway} güvenli altyapısı ile 256-bit SSL</p>
        </aside>
      </form>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="border bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-3 bg-muted/40">
        <Icon className="h-4 w-4 text-amber-brand" />
        <h3 className="font-display text-sm font-bold uppercase">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-semibold mb-1.5 block">{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {children}
    </div>
  );
}
function ConsentRow({ checked, onChange, title, desc }: { checked: boolean; onChange: (v: boolean) => void; title: string; desc: string }) {
  return (
    <label className="flex items-start gap-3 border p-3 cursor-pointer hover:bg-muted/30">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} className="mt-0.5" />
      <div className="text-sm">
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
    </label>
  );
}
