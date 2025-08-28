"use client";
import React from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix leaflet default icon path for React
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Define Props type
type Props = {
  senderPosition: LatLngExpression;
  receiverPosition?: LatLngExpression;
};

const isValidLatLng = (pos: any) =>
  Array.isArray(pos) &&
  pos.length === 2 &&
  typeof pos[0] === "number" &&
  typeof pos[1] === "number";

const WorldMapChartClient: React.FC<Props> = ({
  senderPosition,
  receiverPosition,
}) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Unique id/key for the map container to avoid Leaflet complaining about
  // reusing the same DOM container across mounts (helps in React StrictMode).
  const mapId = React.useMemo(
    () => `map-${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  if (
    !mounted ||
    !isValidLatLng(senderPosition) ||
    (receiverPosition && !isValidLatLng(receiverPosition))
  )
    return null;

  const center = receiverPosition || senderPosition;

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg mb-8">
      <MapContainer
        id={mapId}
        key={mapId}
        center={center}
        zoom={5}
        style={{ height: "100%", width: "100%", zIndex: "1" }}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={senderPosition} />
        {receiverPosition && <Marker position={receiverPosition} />}
        {receiverPosition && (
          <Polyline
            positions={[senderPosition, receiverPosition]}
            pathOptions={{ color: "red" }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default WorldMapChartClient;
