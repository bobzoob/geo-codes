import { MapContainer as LeafletMapContainer, TileLayer } from "react-leaflet";
import type { ReactNode } from "react";

/**
 * HERE IS WHERE YOU CONTROLL THE VIEW OF THE MAP
 */
interface MapWrapperProps {
  children: ReactNode;
}

function MapWrapper({ children }: MapWrapperProps) {
  return (
    <LeafletMapContainer
      center={[50.92878, 11.5899]}
      zoom={7}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </LeafletMapContainer>
  );
}

export default MapWrapper;
