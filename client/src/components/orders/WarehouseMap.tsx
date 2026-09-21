'use client';

import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { MAP_ATTRIBUTION, MAP_TILE_URL } from '@/lib/config';
import type { Warehouse } from '@/types';

/** Map with the order's warehouse. Loaded lazily and only in the browser (Leaflet needs `window`). */
export default function WarehouseMap({ warehouse }: { warehouse: Warehouse }) {
  return (
    <MapContainer
      center={[warehouse.lat, warehouse.lng]}
      zoom={12}
      scrollWheelZoom={false}
      className="warehouse-map"
    >
      <TileLayer
        attribution={MAP_ATTRIBUTION}
        url={MAP_TILE_URL}
      />
      <CircleMarker
        center={[warehouse.lat, warehouse.lng]}
        radius={10}
        pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#5a9a24', fillOpacity: 0.9 }}
      >
        <Popup>
          <strong>{warehouse.name}</strong>
          <br />
          {warehouse.city}, {warehouse.address}
        </Popup>
      </CircleMarker>
    </MapContainer>
  );
}
