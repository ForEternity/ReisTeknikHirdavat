import type { Channel, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ChannelBadge({ channel }: { channel: Channel }) {
  const map: Record<Channel, { label: string; cls: string }> = {
    Web: { label: "Yerel Web", cls: "bg-channel-web/15 text-channel-web border-channel-web/30" },
    Trendyol: { label: "Trendyol", cls: "bg-channel-trendyol/15 text-channel-trendyol border-channel-trendyol/40" },
    Hepsiburada: { label: "Hepsiburada", cls: "bg-channel-hepsiburada/15 text-channel-hepsiburada border-channel-hepsiburada/40" },
  };
  const v = map[channel];
  return (
    <span className={cn("inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide", v.cls)}>
      {v.label}
    </span>
  );
}

export function StatusTag({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    Preparing: "bg-warning/15 text-warning border-warning/40",
    Shipped: "bg-info/15 text-info border-info/40",
    Delivered: "bg-success/15 text-success border-success/40",
    Cancelled: "bg-destructive/15 text-destructive border-destructive/40",
    Returned: "bg-muted text-muted-foreground border-border",
  };
  const labels: Record<OrderStatus, string> = {
    Preparing: "Hazırlanıyor", Shipped: "Kargoda", Delivered: "Teslim Edildi", Cancelled: "İptal", Returned: "İade",
  };
  return (
    <span className={cn("inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium", map[status])}>
      {labels[status]}
    </span>
  );
}
