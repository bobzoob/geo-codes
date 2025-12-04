import { Marker, Popup, Tooltip } from "react-leaflet";
import type { HistoricalFeatureCollection, EntityMap } from "../types/geojson";
import type { LatLngExpression } from "leaflet";

//**
// each new layer type needs a new comonent to render it. here we render tooltips
// **

interface PointLayerProps {
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
  entities: EntityMap;
}

function PointLayer({ data, showAllTooltips, entities }: PointLayerProps) {
  const getEntityLabel = (id?: string) =>
    id && entities[id] ? entities[id].label : null;

  return (
    <>
      {data.features.map((feature, index) => {
        // SAFETY CHECK: If geometry is missing, skip this item
        if (!feature.geometry) return null;

        // Now it is safe to access .type
        if (feature.geometry.type !== "Point") return null;

        // GeoJSON coordinates are [lon feature.geometry.coordinates;
        // but leaflet expects [latitude, longitude] -> reverse!
        const [longitude, latitude] = feature.geometry.coordinates;
        const position: LatLngExpression = [latitude, longitude];
        const props = feature.properties;

        //resolve place
        //fallback if pkacename links nowhere
        const displayName =
          props.title ||
          props.name ||
          getEntityLabel(props.placeId) ||
          "Unknown Location";

        return (
          <Marker key={feature.id || index} position={position}>
            <Tooltip permanent={showAllTooltips}>
              <strong>{displayName}</strong>
            </Tooltip>

            <Popup>
              <strong>{displayName}</strong>
              {props.date_start && <div>Date: {props.date_start}</div>}
              <p>{props.description || props.full_text || ""}</p>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default PointLayer;
