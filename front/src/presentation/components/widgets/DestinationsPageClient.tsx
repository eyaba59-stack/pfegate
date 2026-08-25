"use client";

import { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Icon from "@/presentation/components/ui/Icon";

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

const MONASTIR = { lat: 35.7581, lng: 10.7545 };

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

const BAR_COLORS: Record<string, string> = {
  "bg-secondary": "#00668a",
  "bg-secondary-container": "#40c2fd",
  "bg-tertiary-fixed-dim": "#b7c8e1",
  "bg-primary-fixed-dim": "#bec6e0",
  "bg-surface-variant": "#a0a4a8",
};

interface DestinationsPageClientProps {
  destinations: DestData[];
  allDestinations: DestData[];
}

export default function DestinationsPageClient({ destinations, allDestinations }: DestinationsPageClientProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string>("Tous");

  const countries = useMemo(() => {
    const set = new Set(allDestinations.map((d) => d.country));
    return ["Tous", ...Array.from(set).sort()];
  }, [allDestinations]);

  const filteredDestinations = useMemo(() => {
    if (activeCountry === "Tous") return allDestinations;
    return allDestinations.filter((d) => d.country === activeCountry);
  }, [allDestinations, activeCountry]);

  const maxPassengers = useMemo(
    () => Math.max(...filteredDestinations.map((d) => d.passengers), 1),
    [filteredDestinations]
  );

  const select = (code: string) => setSelected((prev) => (prev === code ? null : code));
  const reset = () => setSelected(null);

  const selectedDest = selected ? filteredDestinations.find((d) => d.code === selected) : null;

  return (
    <>
      {/* Map Widget */}
      <div className="col-span-12 flex flex-col overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest shadow-[0px_4px_12px_rgba(15,23,42,0.03)] transition-colors duration-300 hover:border-secondary xl:col-span-8">
        <div className="relative z-10 flex items-center justify-between border-b border-surface-container bg-surface-container-lowest p-widget-padding">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Carte des Lignes (MIR)</h3>
          <div className="flex items-center gap-2">
            {selected && (
              <button
                type="button"
                onClick={reset}
                className="font-label-caps text-label-caps text-secondary transition-colors hover:text-on-secondary-container"
              >
                Réinitialiser
              </button>
            )}
            <span className="rounded bg-surface-container px-2 py-1 font-label-caps text-label-caps text-on-surface-variant">
              {filteredDestinations.length} destinations
            </span>
          </div>
        </div>

        <div className="relative h-[500px] w-full">
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

            <FitBounds destinations={filteredDestinations} />

            {/* Monastir hub */}
            <Marker position={[MONASTIR.lat, MONASTIR.lng]} icon={hubIcon}>
              <Popup>
                <div className="text-center">
                  <strong>MIR — Monastir</strong>
                  <br />
                  Aéroport International
                </div>
              </Popup>
            </Marker>

            {/* Polylines + Markers */}
            {filteredDestinations.map((d) => (
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
                  eventHandlers={{
                    click: () => select(d.code),
                  }}
                />
                <Marker
                  position={[d.lat, d.lng]}
                  icon={markerIcon(selected === d.code)}
                  eventHandlers={{ click: () => select(d.code) }}
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

          {/* Selected destination info overlay */}
          {selectedDest && (
            <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-outline-variant bg-surface-container-lowest/95 px-4 py-3 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-on-secondary font-body-sm font-bold">
                  {selectedDest.rank}
                </div>
                <div>
                  <p className="font-body-lg font-medium text-on-surface">{selectedDest.city} ({selectedDest.code})</p>
                  <p className="font-body-sm text-on-surface-variant">{selectedDest.country}</p>
                  <p className="font-data-mono text-data-mono text-secondary font-semibold">
                    {selectedDest.passengers.toLocaleString("fr-FR")} pax
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar: Country Filter + Destinations List */}
      <div className="col-span-12 flex flex-col rounded-xl border border-surface-variant bg-surface-container-lowest shadow-[0px_4px_12px_rgba(15,23,42,0.03)] xl:col-span-4">
        {/* Country Segmentation */}
        <div className="border-b border-surface-container p-widget-padding">
          <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-3">Filtrer par Pays</h4>
          <div className="flex flex-wrap gap-2">
            {countries.map((country) => {
              const count = country === "Tous" ? allDestinations.length : allDestinations.filter((d) => d.country === country).length;
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => {
                    setActiveCountry(country);
                    setSelected(null);
                  }}
                  className={`rounded-full px-3 py-1.5 text-body-sm font-medium transition-all duration-200 ${
                    activeCountry === country
                      ? "bg-secondary text-on-secondary shadow-sm"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-variant"
                  }`}
                >
                  {country} <span className="ml-1 text-[11px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List Header */}
        <div className="flex items-center justify-between p-widget-padding pb-2">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Destinations</h3>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              {activeCountry === "Tous" ? "Toutes les destinations" : activeCountry} — Volume de passagers
            </p>
          </div>
          {selected && (
            <button
              type="button"
              onClick={reset}
              className="font-label-caps text-label-caps text-secondary transition-colors hover:text-on-secondary-container"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Destinations List */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-widget-padding pb-widget-padding">
          {filteredDestinations.map((d) => (
            <div
              key={d.code}
              className={`cursor-pointer rounded-lg border p-3 transition-all duration-200 ${
                selected === d.code
                  ? "border-secondary bg-secondary/5 shadow-sm"
                  : "border-transparent hover:bg-surface-container"
              }`}
              style={{ opacity: selected && selected !== d.code ? 0.4 : 1 }}
              onClick={() => select(d.code)}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full font-body-sm font-bold"
                    style={{ background: BAR_COLORS[d.barColor] || "#00668a", color: "#fff" }}
                  >
                    {d.rank}
                  </div>
                  <div>
                    <span className="block font-body-md font-medium text-on-surface">{d.city} ({d.code})</span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant">{d.country}</span>
                  </div>
                </div>
                <span className="font-data-mono text-data-mono text-on-surface">
                  {d.passengers.toLocaleString("fr-FR")} <span className="font-body-sm text-on-surface-variant">pax</span>
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(d.passengers / maxPassengers) * 100}%`,
                    background: BAR_COLORS[d.barColor] || "#00668a",
                  }}
                />
              </div>
            </div>
          ))}

          {filteredDestinations.length === 0 && (
            <div className="py-8 text-center font-body-sm text-on-surface-variant">
              Aucune destination pour ce pays.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
