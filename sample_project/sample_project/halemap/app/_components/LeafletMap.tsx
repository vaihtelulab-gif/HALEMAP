"use client";

import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";

const DEFAULT_CENTER: [number, number] = [35.681236, 139.767125]; // Tokyo Station

export function LeafletMap() {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={13}
      zoomControl={false}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
}

