// web/src/components/map/FleetMap.tsx

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Ship, Globe } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface Vessel {
  id: string;
  name: string;
  imoNumber: string;
  status: string;
  lat: number;
  lng: number;
}

// Maritime Coordinate Helper
const toMaritimeCoord = (decimal: number, isLongitude: boolean) => {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutes = ((absolute - degrees) * 60).toFixed(2);
  
  let hemisphere = "";
  if (isLongitude) {
    hemisphere = decimal >= 0 ? "E" : "W";
  } else {
    hemisphere = decimal >= 0 ? "N" : "S";
  }

  const dStr = degrees.toString().padStart(isLongitude ? 3 : 2, '0');
  const mStr = parseFloat(minutes).toString().padStart(5, '0');

  return `${dStr}°${mStr}'${hemisphere}`;
};

const createVesselIcon = (status: string) => {
  const color = status?.toUpperCase() === 'ONLINE' ? '#22c55e' : '#ef4444';
  const html = renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
      <div className={`absolute w-8 h-8 rounded-full opacity-20 animate-ping`} style={{ backgroundColor: color }} />
      <div className="relative bg-white p-1.5 rounded-full shadow-lg border-2" style={{ borderColor: color }}>
        <Ship size={16} style={{ color: color }} />
      </div>
    </div>
  );

  return L.divIcon({
    html,
    className: 'custom-vessel-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export default function FleetMap({ vessels }: { vessels: Vessel[] }) {
  return (
    <MapContainer 
      center={[20, 0]} 
      zoom={3} 
      className="w-full h-full"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
      />
      
      {vessels.map((vessel) => (
        <Marker 
          key={vessel.id} 
          position={[vessel.lat, vessel.lng]} 
          icon={createVesselIcon(vessel.status)}
        >
          <Popup className="vessel-popup">
            <div className="w-56 p-1 font-sans">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-black text-[#3194A0] uppercase m-0 leading-tight">
                    {vessel.name}
                  </h3>
                  <span className="text-[9px] font-bold text-muted-foreground tracking-widest">
                    IMO: {vessel.imoNumber}
                  </span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                  vessel.status?.toUpperCase() === 'ONLINE' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                }`}>
                  {vessel.status}
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe size={12} className="text-[#3194A0]" />
                    <span className="text-[10px] font-bold uppercase">Lat</span>
                  </div>
                  <span className="text-[11px] font-mono font-black text-foreground">
                    {toMaritimeCoord(vessel.lat, false)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe size={12} className="text-[#3194A0]" />
                    <span className="text-[10px] font-bold uppercase">Long</span>
                  </div>
                  <span className="text-[11px] font-mono font-black text-foreground">
                    {toMaritimeCoord(vessel.lng, true)}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}