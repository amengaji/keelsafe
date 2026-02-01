import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const FleetMap = ({ vessels }) => {
  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border shadow-lg">
      <MapContainer center={[15, 100]} zoom={3} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {vessels.map((vessel) => (
          vessel.lat && (
            <Marker key={vessel.id} position={[vessel.lat, vessel.lng]}>
              <Popup>
                <div className="text-sm font-sans">
                  <h3 className="font-bold border-b pb-1">{vessel.name}</h3>
                  <p className="mt-1">Status: <span className="text-green-600 font-medium">{vessel.status}</span></p>
                  <p>Active Permits: {vessel.activePermitCount}</p>
                  <p className="text-xs text-gray-500 mt-2">IMO: {vessel.imoNumber}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default FleetMap;