import { useState } from "react";
import { MapContainer, TileLayer, useMapEvents, Rectangle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function RegionSelector({ onSelect }) {
  const [bounds, setBounds] = useState(null);

  useMapEvents({
    click(e) {
      const latlng = e.latlng;
      const size = 5;
      const newBounds = [
        [latlng.lat - size, latlng.lng - size],
        [latlng.lat + size, latlng.lng + size],
      ];
      setBounds(newBounds);
      onSelect(newBounds);
    },
  });

  return bounds && <Rectangle bounds={bounds} pathOptions={{ color: "blue" }} />;
}

export default function MapSelector({ onRegionSelect }) {
  return (
    <MapContainer center={[0, 0]} zoom={2} className="h-96 w-full rounded shadow">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <RegionSelector onSelect={onRegionSelect} />
    </MapContainer>
  );
}
