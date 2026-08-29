"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DestData {
  rank: number;
  code: string;
  city: string;
  country: string;
  passengers: number;
  sharePercent: number;
  barColor: string;
  lat: number;
  lng: number;
}

const COLORS = [
  "#00668a",
  "#40c2fd",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#10b981",
];

interface Props {
  destinations: DestData[];
  selected: string | null;
  onSelect: (code: string) => void;
}

export default function DestinationsPieChart({ destinations, selected, onSelect }: Props) {
  const top = destinations.slice(0, 8);
  const others = destinations.slice(8);
  const othersPax = others.reduce((s, d) => s + d.passengers, 0);

  const labels = [...top.map((d) => d.city), ...(others.length > 0 ? ["Autres"] : [])];
  const values = [...top.map((d) => d.passengers), ...(others.length > 0 ? [othersPax] : [])];
  const bgColors = [...COLORS.slice(0, top.length), ...(others.length > 0 ? ["#d1d5db"] : [])];

  const hoverBg = bgColors.map((c) => c);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: bgColors,
        borderColor: "#fff",
        borderWidth: 2,
        hoverBackgroundColor: hoverBg,
        hoverBorderColor: "#fff",
        hoverBorderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "55%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#131b2e",
        titleColor: "#fff",
        bodyColor: "#d1d5db",
        borderColor: "#374151",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        titleFont: { size: 12, weight: "bold" as const },
        bodyFont: { size: 11 },
        callbacks: {
          title: (items: any) => {
            const idx = items[0]?.dataIndex;
            return idx < top.length ? `${top[idx].city} (${top[idx].code})` : "Autres destinations";
          },
          label: (item: any) => {
            const total = values.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((item.raw / total) * 100).toFixed(1) : "0";
            return ` ${item.raw.toLocaleString("fr-FR")} pax (${pct}%)`;
          },
        },
      },
    },
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0) {
        const idx = elements[0].index;
        if (idx < top.length) {
          onSelect(top[idx].code);
        }
      }
    },
    onHover: (event: any, elements: any[]) => {
      const target = event?.native?.target as HTMLElement | undefined;
      if (target) {
        target.style.cursor = elements.length > 0 ? "pointer" : "default";
      }
    },
  };

  return (
    <div className="relative" style={{ height: 200 }}>
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] font-medium text-on-surface-variant uppercase">Top</span>
        <span className="text-lg font-bold text-on-surface">{top.length}</span>
      </div>
    </div>
  );
}
