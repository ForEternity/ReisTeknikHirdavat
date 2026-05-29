import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine, Product, ProductVariant } from "@/lib/types";

interface CartCtx {
  lines: CartLine[];
  add: (p: Product, v?: ProductVariant, qty?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const Ctx = createContext<CartCtx | null>(null);
const STORAGE = "rt_cart_v1";
const keyOf = (l: { productId: string; variantId?: string }) => `${l.productId}:${l.variantId ?? ""}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(STORAGE) ?? "[]"); } catch { return []; }
  });
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE, JSON.stringify(lines));
  }, [lines]);

  const add = useCallback((p: Product, v?: ProductVariant, qty = 1) => {
    setLines((prev) => {
      const k = keyOf({ productId: p.id, variantId: v?.id });
      const existing = prev.find((l) => keyOf(l) === k);
      if (existing) return prev.map((l) => (keyOf(l) === k ? { ...l, quantity: l.quantity + qty } : l));
      return [...prev, {
        productId: p.id, variantId: v?.id, name: v ? `${p.name} — ${v.name}` : p.name,
        sku: v?.sku ?? p.sku, unitPrice: v?.price ?? p.price, quantity: qty, image: p.images[0],
      }];
    });
  }, []);
  const remove = useCallback((k: string) => setLines((prev) => prev.filter((l) => keyOf(l) !== k)), []);
  const setQty = useCallback((k: string, qty: number) =>
    setLines((prev) => prev.map((l) => (keyOf(l) === k ? { ...l, quantity: Math.max(1, qty) } : l))), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartCtx>(() => ({
    lines, add, remove, setQty, clear,
    count: lines.reduce((a, l) => a + l.quantity, 0),
    subtotal: lines.reduce((a, l) => a + l.quantity * l.unitPrice, 0),
  }), [lines, add, remove, setQty, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
};

export const cartKey = keyOf;
