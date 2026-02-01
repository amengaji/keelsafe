// web/src/components/map/FleetMap.tsx

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- CUSTOM COLORED MARKERS ---
const createIcon = (color: string) => new L.DivIcon({
  html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
  className: 'custom-vessel-icon',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const icons = {
  green: createIcon('#10B981'),  // Green for ONLINE
  red: createIcon('#EF4444'),    // Red for OFFLINE
  orange: createIcon('#F59E0B'), // Orange for SYNCING
};

interface VesselLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
}

interface FleetMapProps {
  vessels: VesselLocation[];
}

export default function FleetMap({ vessels }: FleetMapProps) {
  const center: [number, number] = [1.29027, 103.851959];

  return (
    <MapContainer 
      center={center} 
      zoom={3} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {vessels.map((vessel) => {
        // Determine icon color based on status
        const statusKey = vessel.status.toUpperCase();
        const icon = statusKey === 'ONLINE' ? icons.green : 
                     statusKey === 'OFFLINE' ? icons.red : icons.orange;

        return (
          <Marker key={vessel.id} position={[vessel.lat, vessel.lng]} icon={icon}>
            <Popup>
              <div className="p-1 font-sans">
                <h3 className="font-black text-primary uppercase text-xs">{vessel.name}</h3>
                <p className={`text-[10px] font-bold mt-1 ${
                  statusKey === 'ONLINE' ? 'text-green-600' : 
                  statusKey === 'OFFLINE' ? 'text-red-600' : 'text-orange-600'
                }`}>
                  STATUS: {statusKey}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}