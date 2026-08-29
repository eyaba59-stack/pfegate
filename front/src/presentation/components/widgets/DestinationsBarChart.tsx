"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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

const GRADIENT_COLORS = [
  ["#00668a", "#008fb4"],
  ["#40c2fd", "#2dd4bf"],
  ["#3b82f6", "#60a5fa"],
  ["#6366f1", "#818cf8"],
  ["#8b5cf6", "#a78bfa"],
  ["#ec4899", "#f472b6"],
  ["#f43f5e", "#fb7185"],
  ["#f97316", "#fb923c"],
  ["#eab308", "#facc15"],
  ["#10b981", "#34d399"],
];

interface Props {
  destinations: DestData[];
  selected: string | null;
  onSelect: (code: string) => void;
}

export default function DestinationsBarChart({ destinations, selected, onSelect }: Props) {
  const labels = destinations.map((d) => d.city);
  const values = destinations.map((d) => d.passengers);

  const backgroundColors = destinations.map((d, i) => {
    if (selected && selected !== d.code) return "rgba(200,200,200,0.3)";
    if (selected === d.code) return GRADIENT_COLORS[i % GRADIENT_COLORS.length][0];
    return GRADIENT_COLORS[i % GRADIENT_COLORS.length][0] + "99";
  });

  const borderColors = destinations.map((d, i) => {
    if (selected && selected !== d.code) return "transparent";
    return GRADIENT_COLORS[i % GRADIENT_COLORS.length][0];
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Passagers",
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: GRADIENT_COLORS.slice(0, destinations.length).map((c) => c[0]),
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#131b2e",
        titleColor: "#fff",
        bodyColor: "#d1d5db",
        borderColor: "#374151",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: { size: 13, weight: "bold" as const },
        bodyFont: { size: 12 },
        callbacks: {
          title: (items: any) => {
            const idx = items[0]?.dataIndex;
            const d = destinations[idx];
            return d ? `${d.city} (${d.code})` : "";
          },
          label: (item: any) => {
            const d = destinations[item.dataIndex];
            return d ? `  ${d.passengers.toLocaleString("fr-FR")} passagers (${d.sharePercent}%)` : "";
          },
          afterLabel: (item: any) => {
            const d = destinations[item.dataIndex];
            return d ? `  ${d.country}` : "";
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.04)", drawBorder: false },
        ticks: {
          color: "#9ca3af",
          font: { size: 10 },
          callback: (v: any) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v),
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: "#374151",
          font: { size: 12, weight: 500 },
          padding: 8,
        },
      },
    },
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0) {
        const idx = elements[0].index;
        const d = destinations[idx];
        if (d) onSelect(d.code);
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
    <div style={{ height: Math.max(destinations.length * 44, 200) }}>
      <Bar data={data} options={options} />
    </div>
  );
}
