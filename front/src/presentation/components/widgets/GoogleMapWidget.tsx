"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from "@react-google-maps/api";

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

const MONASTIR: DestData = {
  rank: 0,
  code: "MIR",
  city: "Monastir",
  country: "Tunisie",
  passengers: 0,
  sharePercent: 0,
  barColor: "bg-primary",
  lat: 35.7581,
  lng: 10.7545,
};

const REGION_CENTERS: Record<string, google.maps.LatLngLiteral> = {
  "Tous": { lat: 39, lng: 20 },
  "France": { lat: 46.5, lng: 3 },
  "Belgique": { lat: 50.5, lng: 4.5 },
  "Allemagne": { lat: 50.8, lng: 8 },
  "Italie": { lat: 44, lng: 11 },
  "Suisse": { lat: 46.8, lng: 8 },
  "Turquie": { lat: 39, lng: 32 },
  "Égypte": { lat: 28, lng: 30 },
  "Émirats": { lat: 24, lng: 54 },
  "Qatar": { lat: 25.3, lng: 51.2 },
};

const REGION_ZOOMS: Record<string, number> = {
  "Tous": 4,
  "France": 5,
  "Belgique": 7,
  "Allemagne": 6,
  "Italie": 5,
  "Suisse": 7,
  "Turquie": 5,
  "Égypte": 5,
  "Émirats": 7,
  "Qatar": 8,
};

const mapContainerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  zoomControlOptions: { position: 9 as google.maps.ControlPosition },
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#f2f4f6" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8a8f98" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#d4e3f5" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#e8eaed" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dde1e5" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eef0f2" }] },
    { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#c8cdd3", weight: 1 }] },
    { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  ],
};

function makeHubSvg(selected: boolean) {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
        <defs><filter id="ds"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/></filter></defs>
        <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="#00668a" filter="url(#ds)"/>
        <circle cx="16" cy="16" r="7" fill="#fff"/>
        <circle cx="16" cy="16" r="4" fill="#00668a"/>
      </svg>`
    )}`,
    scaledSize: new google.maps.Size(32, 42),
    anchor: new google.maps.Point(16, 42),
  };
}

function makeDestSvg(color: string, size: number) {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="${color}" stroke="#fff" stroke-width="2"/>
      </svg>`
    )}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size / 2),
  };
}

interface GoogleMapWidgetProps {
  destinations: DestData[];
  selected: string | null;
  activeCountry: string;
  onSelect: (code: string) => void;
}

export default function GoogleMapWidget({ destinations, selected, activeCountry, onSelect }: GoogleMapWidgetProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [infoOpen, setInfoOpen] = useState<string | null>(null);
  const animatingRef = useRef(false);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || animatingRef.current) return;

    const center = REGION_CENTERS[activeCountry] || REGION_CENTERS["Tous"];
    const zoom = REGION_ZOOMS[activeCountry] || 4;

    animatingRef.current = true;
    map.panTo(center);
    map.setZoom(zoom);

    setTimeout(() => {
      animatingRef.current = false;
    }, 400);
  }, [activeCountry]);

  const validDests = destinations.filter((d) => d.lat !== 0 && d.lng !== 0);
  const hubIcon = isLoaded ? makeHubSvg(false) : undefined;
  const maxPax = Math.max(...validDests.map((d) => d.passengers), 1);

  const getMarkerIcon = useCallback(
    (d: DestData) => {
      const isActive = selected === d.code;
      const ratio = d.passengers / maxPax;
      const size = isActive ? 18 : Math.round(10 + ratio * 10);
      const color = isActive ? "#40c2fd" : "#131b2e";
      return makeDestSvg(color, size);
    },
    [selected, maxPax]
  );

  if (loadError) return <div className="flex h-full items-center justify-center bg-surface-container text-on-surface-variant text-sm">Erreur de chargement de la carte</div>;
  if (!isLoaded) return <div className="flex h-full items-center justify-center bg-surface-container"><div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" /></div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={REGION_CENTERS[activeCountry] || REGION_CENTERS["Tous"]}
      zoom={REGION_ZOOMS[activeCountry] || 4}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {/* Polylines */}
      {validDests.map((d) => {
        const isActive = selected === d.code;
        const dimmed = selected && !isActive;
        return (
          <Polyline
            key={`poly-${d.code}`}
            path={[
              { lat: MONASTIR.lat, lng: MONASTIR.lng },
              { lat: d.lat, lng: d.lng },
            ]}
            options={{
              strokeColor: isActive ? "#00668a" : "#40c2fd",
              strokeOpacity: dimmed ? 0.1 : isActive ? 1 : 0.4,
              strokeWeight: isActive ? 3 : 1.5,
              geodesic: true,
              icons: isActive
                ? []
                : [
                    {
                      icon: { path: "M 0,-1 0,1", strokeOpacity: 1 } as google.maps.Symbol,
                      offset: "0",
                      repeat: "8px",
                    },
                  ],
            }}
            onClick={() => onSelect(d.code)}
          />
        );
      })}

      {/* Hub marker */}
      {hubIcon && (
        <Marker
          position={{ lat: MONASTIR.lat, lng: MONASTIR.lng }}
          icon={hubIcon}
          zIndex={1000}
        />
      )}

      {/* Destination markers */}
      {validDests.map((d) => {
        const dimmed = selected && selected !== d.code;
        return (
          <Marker
            key={`mk-${d.code}`}
            position={{ lat: d.lat, lng: d.lng }}
            icon={getMarkerIcon(d)}
            opacity={dimmed ? 0.2 : 1}
            zIndex={selected === d.code ? 999 : d.rank}
            onClick={() => {
              onSelect(d.code);
              setInfoOpen(d.code);
            }}
          />
        );
      })}

      {/* Info window */}
      {infoOpen && (() => {
        const d = validDests.find((x) => x.code === infoOpen);
        if (!d) return null;
        return (
          <InfoWindow
            position={{ lat: d.lat, lng: d.lng }}
            onCloseClick={() => setInfoOpen(null)}
            options={{ pixelOffset: new google.maps.Size(0, -20) }}
          >
            <div style={{ fontFamily: "Inter, sans-serif", minWidth: 160 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#131b2e" }}>{d.city} ({d.code})</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{d.country}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#00668a" }}>
                {d.passengers.toLocaleString("fr-FR")} passagers
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Rang #{d.rank}</div>
            </div>
          </InfoWindow>
        );
      })()}
    </GoogleMap>
  );
}
