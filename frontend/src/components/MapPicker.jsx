import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";


// Fix default icon path
import "leaflet/dist/leaflet.css";
delete L.Icon.Default.prototype._getIconUrl;

function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng); // Send lat/lng to parent
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ onLocationChange }) {
  return (
    <MapContainer center={[33.6844, 73.0479]} zoom={6} style={{ height: "300px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker onSelect={onLocationChange} />
    </MapContainer>
  );
}
