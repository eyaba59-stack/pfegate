"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface DestData {
  rank: number;
  code: string;
  city: string;
  country: string;
  passengers: number;
  lat: number;
  lng: number;
}

export const MONASTIR = { lat: 35.7581, lng: 10.7545 };

function makeMarkerIcon(selected: boolean) {
  const size = selected ? 18 : 12;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${selected ? "#00668a" : "#131b2e"};
      border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,.35);
      transition:all .2s;
    "/>`,
  });
}

const hubIcon = L.divIcon({
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  html: `<div style="
    width:24px;height:24px;border-radius:50%;
    background:#00668a;border:3px solid #fff;
    box-shadow:0 2px 8px rgba(0,102,138,.5);
  "></div>`,
});

interface LeafletMapProps {
  destinations: DestData[];
  selected: string | null;
  onSelect: (code: string) => void;
}

export default function LeafletMap({ destinations, selected, onSelect }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylinesRef = useRef<Map<string, L.Polyline>>(new Map());
  const hubRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [MONASTIR.lat, MONASTIR.lng],
      zoom: 5,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current.clear();
    polylinesRef.current.forEach((p: L.Polyline) => map.removeLayer(p));
    polylinesRef.current.clear();
    if (hubRef.current) {
      map.removeLayer(hubRef.current);
    }

    const hub = L.marker([MONASTIR.lat, MONASTIR.lng] as L.LatLngExpression, { icon: hubIcon, interactive: false }).addTo(map);
    hubRef.current = hub;

    const bounds = L.latLngBounds([[MONASTIR.lat, MONASTIR.lng]]);

    destinations.forEach((d) => {
      if (!d.lat || !d.lng) return;

      bounds.extend([d.lat, d.lng]);

      const polyline = L.polyline(
        [[d.lat, d.lng], [MONASTIR.lat, MONASTIR.lng]],
        {
          color: "#40c2fd",
          weight: 1.5,
          opacity: 0.5,
          dashArray: "6 8",
        }
      ).addTo(map);
      polyline.on("click", () => onSelect(d.code));
      polylinesRef.current.set(`poly-${d.code}`, polyline);

      const marker = L.marker([d.lat, d.lng], { icon: makeMarkerIcon(false) }).addTo(map);
      marker.bindPopup(`
        <div style="text-align:center">
          <strong>${d.city} (${d.code})</strong><br/>
          ${d.country}<br/>
          <span style="font-weight:600">${d.passengers.toLocaleString("fr-FR")} pax</span>
        </div>
      `);
      marker.on("click", () => onSelect(d.code));
      markersRef.current.set(d.code, marker);
    });

    if (destinations.length === 1 && destinations[0].lat && destinations[0].lng) {
      map.setView([destinations[0].lat, destinations[0].lng], 6);
    } else {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 });
    }
  }, [destinations, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    destinations.forEach((d) => {
      const marker = markersRef.current.get(d.code);
      if (marker) {
        marker.setIcon(makeMarkerIcon(selected === d.code));
      }

      const polyline = polylinesRef.current.get(`poly-${d.code}`);
      if (polyline) {
        polyline.setStyle({
          color: selected === d.code ? "#00668a" : "#40c2fd",
          weight: selected === d.code ? 3 : 1.5,
          opacity: selected === d.code ? 1 : 0.5,
          dashArray: selected === d.code ? undefined : "6 8",
        });
      }
    });
  }, [selected, destinations]);

  return <div ref={containerRef} className="h-full w-full" />;
}
