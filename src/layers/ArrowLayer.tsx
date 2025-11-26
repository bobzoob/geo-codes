import ArrowPolyline from "../layers/ArrowPolyline";
import type { HistoricalFeatureCollection, EntityMap } from "../types/geojson";
import L from "leaflet";

interface ArrowLayerProps {
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
  entities: EntityMap;
}

function ArrowLayer({ data, showAllTooltips, entities }: ArrowLayerProps) {
  const getName = (id?: string) => {
    if (!id || !entities[id]) return "Unknown";
    return entities[id].name;
  };
  return (
    <>
      {data.features.map((feature, index) => {
        // typescript often causes errors when it cant be sure that we only process the correct type, here: LineString
        if (feature.geometry.type !== "LineString") {
          return null;
        }

        // swap coordinates! GEOjson and leaflet are opposite here
        const positions = feature.geometry.coordinates.map(
          (coord) => [coord[1], coord[0]] as L.LatLngTuple
        );

        // resolve data
        const props = feature.properties;
        const senderName = getName(props.senderId);
        const recipientName = getName(props.recipientId);

        const richDescription = `
          From: ${senderName}
          To: ${recipientName}
          
          ${props.description || ""}
        `;

        // label for tooltip
        const label = `${senderName} → ${recipientName}`;

        return (
          <ArrowPolyline
            key={feature.properties.id || index}
            positions={positions}
            title={label}
            text={richDescription}
            showAllTooltips={showAllTooltips}
          />
        );
      })}
    </>
  );
}

export default ArrowLayer;
