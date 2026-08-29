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
    <div className="flex-1 relative w-full h-full bg-[#e0e3e5] overflow-hidden select-none">
      {/* Background image - only visual, no pointer events */}
      <img
        alt="Geographic Map"
        className="absolute inset-0 w-full h-full object-cover opacity-90 pointer-events-none"
        src={MAP_IMAGE}
        style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.3s ease" }}
      />

      {/* Markers layer - NOT inside scaled container to preserve click events */}
      <div className="absolute inset-0">
        {markers.map((d) => {
          const isActive = selected === d.code;
          return (
            <button
              key={d.code}
              type="button"
              className={`absolute z-10 flex flex-col items-center ${isActive ? "z-20" : ""}`}
              style={{
                top: d.top,
                left: d.left,
                transform: "translate(-50%, -50%)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(isActive ? null : d.code);
              }}
            >
              {/* Invisible large click target */}
              <span className="absolute w-10 h-10 -m-3" />
              {/* Visible dot */}
              <span
                className={`relative block w-3.5 h-3.5 rounded-full border-2 border-white shadow-md transition-all duration-200 ${
                  isActive
                    ? "bg-secondary scale-150 ring-2 ring-secondary/60"
                    : "bg-secondary-container hover:bg-secondary hover:scale-125"
                }`}
              />
              {/* Label on hover or active */}
              <span
                className={`mt-1 whitespace-nowrap bg-primary-container/95 text-on-primary px-2 py-0.5 rounded text-[11px] font-medium shadow-md transition-opacity duration-200 pointer-events-none ${
                  isActive ? "opacity-100" : "opacity-0 hover:opacity-100"
                }`}
                style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)" }}
              >
                {d.city} ({d.code})
              </span>
            </button>
          );
        })}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-30">
        <button
          type="button"
          onClick={zoomIn}
          className="w-10 h-10 bg-surface-container-lowest rounded-lg shadow-md flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors border border-outline-variant"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="w-10 h-10 bg-surface-container-lowest rounded-lg shadow-md flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors border border-outline-variant"
        >
          <span className="material-symbols-outlined">remove</span>
        </button>
      </div>
    </div>
  );
}
