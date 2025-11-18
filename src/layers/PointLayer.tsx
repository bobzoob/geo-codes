import { Marker, Popup, Tooltip } from "react-leaflet";
import type { HistoricalFeatureCollection } from "../types/geojson";
import type { LatLngExpression } from "leaflet";

//**
// each new layer type needs a new comonent to render it. here we render tooltips
// **

interface PointLayerProps {
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
}

function PointLayer({ data, showAllTooltips }: PointLayerProps) {
  return (
    <>
      {data.features.map((feature) => {
        if (feature.geometry.type !== "Point") {
          return null;
        }
        // GeoJSON coordinates are [lon feature.geometry.coordinates;
        // but leaflet expects [latitude, longitude] -> reverse!
        const [longitude, latitude] = feature.geometry.coordinates;
        const position: LatLngExpression = [latitude, longitude];

        return (
          <Marker key={feature.properties.name} position={position}>
            <Tooltip permanent={showAllTooltips}>
              <strong>{feature.properties.name}</strong>
            </Tooltip>

            <Popup>
              <strong>{feature.properties.name}</strong>
              <p>{feature.properties.description}</p>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default PointLayer;
