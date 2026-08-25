"use client";

import Link from "next/link";
import type { KpiMetric, KpiTone } from "@/core/domain/entities/KpiMetric";
import Icon from "@/presentation/components/ui/Icon";

const TONES: Record<KpiTone, { card: string; icon: string }> = {
  default: { card: "border-surface-variant bg-surface-container-lowest", icon: "text-outline" },
  warning: { card: "border-[#FFE082] bg-[#FFF8E1]", icon: "text-[#F57F17]" },
  error: { card: "border-error-container bg-error-container/30", icon: "text-error" },
  success: { card: "border-[#C8E6C9] bg-[#E8F5E9]", icon: "text-[#2E7D32]" },
};

interface KpiCardProps {
  metric: KpiMetric;
  /** Optional deep link — when set the whole card navigates on click. */
  href?: string;
}

export default function KpiCard({ metric, href }: KpiCardProps) {
  const tone = TONES[metric.tone];
  const valueColor =
    metric.tone === "default" ? "text-primary" : metric.tone === "warning" ? "text-[#F57F17]" : metric.tone === "error" ? "text-error" : "text-[#2E7D32]";

  const body = (
    <div
      className={`flex h-full min-h-[120px] flex-col justify-between rounded-lg border p-widget-padding card-shadow transition-all ${tone.card} ${
        href ? "cursor-pointer motion-hover hover:border-secondary hover:shadow-elevated" : ""
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
          {metric.label}
        </span>
        <Icon name={metric.icon} className={`text-[20px] ${tone.icon}`} />
      </div>
      <div className="flex items-end justify-between">
        <span className={`font-display-lg text-display-lg ${valueColor}`}>
          {metric.value}
          {metric.unit && <span className="font-headline-md text-headline-md">{metric.unit}</span>}
        </span>
        {href && <Icon name="arrow_forward" className="text-[16px] text-on-surface-variant" />}
      </div>
    </div>
  );

  if (!href) return body;

  return (
    <Link href={href} aria-label={`Ouvrir ${metric.label}`} className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary">
      {body}
    </Link>
  );
}
