import type { FlightStatus } from "@/core/domain/entities/Flight";

const STATUS_STYLES: Record<FlightStatus, { label: string; className: string }> = {
  ON_TIME: { label: "À l'heure", className: "bg-status-ontime-bg text-status-ontime-fg" },
  DELAYED: { label: "Retardé", className: "bg-status-delayed-bg text-status-delayed-fg" },
  CANCELLED: { label: "Annulé", className: "bg-error-container text-on-error-container" },
  BOARDING: { label: "Embarquement", className: "bg-surface-container-high text-on-surface-variant" },
};

interface StatusBadgeProps {
  status: FlightStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold tracking-wide ${style.className}`}
    >
      {style.label}
    </span>
  );
}
