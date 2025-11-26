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
  const getName = (id?: string) =>
    id && entities[id] ? entities[id].name : null;

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
        const props = feature.properties;

        //resolve place
        const placeName = getName(props.placeId);

        //fallback if pkacename links nowhere
        const displayName = props.name || placeName || "Unknown Location";

        return (
          <Marker key={props.id || props.name} position={position}>
            <Tooltip permanent={showAllTooltips}>
              <strong>{displayName}</strong>
            </Tooltip>

            <Popup>
              <strong>{displayName}</strong>
              {placeName && placeName !== props.name && (
                <div style={{ fontSize: "0.85em", color: "#666" }}>
                  Location: {placeName}
                </div>
              )}
              <p>{props.description}</p>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default PointLayer;
