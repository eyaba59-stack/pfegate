"use client";

import { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

export const MONASTIR = { lat: 35.7581, lng: 10.7545 };

const markerIcon = (selected: boolean) =>
  L.divIcon({
    className: "",
    iconSize: [selected ? 18 : 12, selected ? 18 : 12],
    iconAnchor: [selected ? 9 : 6, selected ? 9 : 6],
    html: `<div style="
      width:${selected ? 18 : 12}px;
      height:${selected ? 18 : 12}px;
      border-radius:50%;
      background:${selected ? "#00668a" : "#131b2e"};
      border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,.35);
      transition:all .2s;
    "/>`,
  });

const hubIcon = L.divIcon({
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  html: `<div style="
    width:24px;height:24px;border-radius:50%;
    background:#00668a;border:3px solid #fff;
    box-shadow:0 2px 8px rgba(0,102,138,.5);
    display:flex;align-items:center;justify-content:center;
  "><div style="width:8px;height:8px;border-radius:50%;background:#fff;animation:pulse 2s infinite"/></div>`,
});

function FitBounds({ destinations }: { destinations: DestData[] }) {
  const map = useMap();
  useEffect(() => {
    if (destinations.length === 0) return;
    if (destinations.length === 1) {
      map.setView([destinations[0].lat, destinations[0].lng], 6);
      return;
    }
    const bounds = L.latLngBounds(
      destinations.map((d) => [d.lat, d.lng] as [number, number])
    );
    bounds.extend([MONASTIR.lat, MONASTIR.lng]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 });
  }, [destinations, map]);
  return null;
}

interface LeafletMapProps {
  destinations: DestData[];
  selected: string | null;
  onSelect: (code: string) => void;
}

export default function LeafletMap({ destinations, selected, onSelect }: LeafletMapProps) {
  return (
    <MapContainer
      center={[MONASTIR.lat, MONASTIR.lng]}
      zoom={5}
      className="h-full w-full"
      zoomControl={false}
      style={{ background: "#f2f4f6" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      <FitBounds destinations={destinations} />

      <Marker position={[MONASTIR.lat, MONASTIR.lng]} icon={hubIcon}>
        <Popup>
          <div className="text-center">
            <strong>MIR — Monastir</strong>
            <br />
            Aéroport International
          </div>
        </Popup>
      </Marker>

      {destinations.map((d) => (
        <div key={d.code}>
          <Polyline
            positions={[
              [MONASTIR.lat, MONASTIR.lng],
              [d.lat, d.lng],
            ]}
            pathOptions={{
              color: selected === d.code ? "#00668a" : "#40c2fd",
              weight: selected === d.code ? 3 : 1.5,
              opacity: selected === d.code ? 1 : 0.5,
              dashArray: selected === d.code ? undefined : "6 8",
            }}
            eventHandlers={{ click: () => onSelect(d.code) }}
          />
          <Marker
            position={[d.lat, d.lng]}
            icon={markerIcon(selected === d.code)}
            eventHandlers={{ click: () => onSelect(d.code) }}
          >
            <Popup>
              <div className="text-center">
                <strong>{d.city} ({d.code})</strong>
                <br />
                {d.country}
                <br />
                <span className="font-semibold">{d.passengers.toLocaleString("fr-FR")} pax</span>
              </div>
            </Popup>
          </Marker>
        </div>
      ))}
    </MapContainer>
  );
}
