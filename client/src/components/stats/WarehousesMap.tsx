'use client';

import 'leaflet/dist/leaflet.css';
import { useTranslations } from 'next-intl';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { formatMoney } from '@/lib/format';
import type { Warehouse } from '@/types';

export interface WarehousePoint extends Warehouse {
  ordersCount: number;
  totalUah: number;
}

/** Leaflet map with OpenStreetMap tiles. Loaded lazily and only in the browser (Leaflet needs `window`). */
export default function WarehousesMap({ points }: { points: WarehousePoint[] }) {
  const t = useTranslations('stats');

  return (
    <MapContainer center={[48.9, 31.2]} zoom={6} scrollWheelZoom={false} className="warehouses-map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((point) => (
        <CircleMarker
          key={point.id}
          center={[point.lat, point.lng]}
          radius={9 + Math.min(point.ordersCount, 6) * 2}
          pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#5a9a24', fillOpacity: 0.85 }}
        >
          <Popup>
            <strong>{point.name}</strong>
            <br />
            {point.city}, {point.address}
            <br />
            {t('mapOrders', { count: point.ordersCount })} · {formatMoney(point.totalUah, 'UAH')}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
