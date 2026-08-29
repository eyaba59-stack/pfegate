"use client";

import { useState, useMemo, useCallback } from "react";

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

interface DestinationMapProps {
  destinations: DestData[];
  selected: string | null;
  onSelect: (code: string | null) => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.3;

const MAP_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuA_cEL_2VwLSr0xyGUdaIOnzSz3r5os5IDcXB5p9TbIIYYdB3tVPAS_e9rXFJ_HSLbjg-jPVeqeIfQ-2DquZBZkHrg1KF6PNGQ3dAuwkQFDAOV2S85a5tVM9VCOqlD-5zNxeh1KD598W54f60sfLWEjsdhfRmGdxNbSfUNJBZHI5aDtLId1SDEm9b5KnS-S2rmtnDchKyslbejO4HN86WSgCfAXTJCL8C4auTIiw4XUkujbhKhSxT1LI0R8qnGlNOs-8CE";

function computeMarkerPosition(lat: number, lng: number): { top: string; left: string } {
  const latMin = 20;
  const latMax = 55;
  const lngMin = -10;
  const lngMax = 80;
  const top = ((latMax - lat) / (latMax - latMin)) * 80 + 5;
  const left = ((lng - lngMin) / (lngMax - lngMin)) * 80 + 5;
  return { top: `${top}%`, left: `${left}%` };
}

export default function DestinationMap({ destinations, selected, onSelect }: DestinationMapProps) {
  const [zoom, setZoom] = useState(1);

  const markers = useMemo(
    () => destinations.map((d) => ({ ...d, ...computeMarkerPosition(d.lat, d.lng) })),
    [destinations]
  );

  const zoomIn = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP)), []);

  return (
    <div className="flex-1 relative w-full h-full bg-surface-container-low overflow-hidden">
      <div className="w-full h-full bg-[#e0e3e5] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-surface-container-low"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.3s ease" }}
        >
          <img alt="Geographic Map" className="w-full h-full object-cover opacity-90" src={MAP_IMAGE} />
        </div>

        <div
          className="absolute inset-0"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.3s ease" }}
        >
          {markers.map((d) => {
            const isActive = selected === d.code;
            return (
              <div
                key={d.code}
                className={`absolute w-3 h-3 rounded-full border border-on-secondary shadow-sm cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "bg-secondary-container animate-pulse ring-2 ring-secondary ring-offset-1"
                    : "bg-secondary-container hover:ring-1 hover:ring-secondary/50"
                }`}
                style={{ top: d.top, left: d.left }}
                onClick={() => onSelect(isActive ? null : d.code)}
                title={`${d.city} (${d.code}) - ${d.passengers.toLocaleString("fr-FR")} pax`}
              />
            );
          })}
        </div>

        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={zoomIn}
            className="w-10 h-10 bg-surface-container-lowest rounded-lg shadow-md flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors border border-outline-variant"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
          <button
            onClick={zoomOut}
            className="w-10 h-10 bg-surface-container-lowest rounded-lg shadow-md flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors border border-outline-variant"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}
