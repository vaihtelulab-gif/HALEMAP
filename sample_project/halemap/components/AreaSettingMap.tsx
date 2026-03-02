'use client';

import { MapContainer, TileLayer, Marker, Rectangle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';

// Leaflet default icon fix
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface AreaSettingMapProps {
  center: { lat: number; lng: number };
  range: { ns: number; ew: number };
  onCenterChange: (latlng: { lat: number; lng: number }) => void;
}

function MapController({ center, onCenterChange }: { center: { lat: number; lng: number }, onCenterChange: (latlng: { lat: number; lng: number }) => void }) {
  const map = useMapEvents({
    click(e) {
      onCenterChange(e.latlng);
    },
  });

  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
}

export default function AreaSettingMap({ center, range, onCenterChange }: AreaSettingMapProps) {
  useEffect(() => {
    const proto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown };
    delete proto._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const bounds = useMemo(() => {
    const latDiff = range.ns / 111111 / 2; // half height in degrees
    const lngDiff = range.ew / (111111 * Math.cos(center.lat * Math.PI / 180)) / 2; // half width in degrees

    return L.latLngBounds(
      [center.lat - latDiff, center.lng - lngDiff],
      [center.lat + latDiff, center.lng + lngDiff]
    );
  }, [center, range]);

  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          onCenterChange(marker.getLatLng());
        }
      },
    }),
    [onCenterChange],
  );

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={center} onCenterChange={onCenterChange} />
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={center}
        ref={markerRef}
      />
      <Rectangle bounds={bounds} pathOptions={{ color: 'blue', weight: 1, fillOpacity: 0.1 }} />
    </MapContainer>
  );
}
