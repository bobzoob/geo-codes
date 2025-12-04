import ArrowPolyline from "../layers/ArrowPolyline";
import type { HistoricalFeatureCollection, EntityMap } from "../types/geojson";
import L from "leaflet";

interface ArrowLayerProps {
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
  entities: EntityMap;
}

function ArrowLayer({ data, showAllTooltips, entities }: ArrowLayerProps) {
  const resolveMentions = (ids?: string[]) => {
    if (!ids || ids.length === 0) return "";
    return ids
      .map((id) => entities[id]?.label)
      .filter(Boolean)
      .join(", ");
  };
  return (
    <>
      {data.features.map((feature, index) => {
        // typescript often causes errors when it cant be sure that we only process the correct type, here: LineString
        if (!feature.geometry) return null;
        if (feature.geometry.type !== "LineString") {
          return null;
        }

        // swap coordinates! GEOjson and leaflet are opposite here
        const positions = feature.geometry.coordinates.map(
          (coord) => [coord[1], coord[0]] as L.LatLngTuple
        );

        // resolve data
        const props = feature.properties;
        const label = props.title || "Unknown Correspondence";

        const previewText = props.full_text
          ? props.full_text.substring(0, 200) +
            (props.full_text.length > 200 ? "..." : "")
          : "";

        const mentionedNames = resolveMentions(props.mentions);

        const richDescription = `
          <strong>Date:</strong> ${props.date_start}<br/>
          ${
            mentionedNames
              ? `<strong>Mentions:</strong> ${mentionedNames}<br/>`
              : ""
          }
          <hr/>
          <div style="max-height: 150px; overflow-y: auto; font-style: italic;">
            "${previewText}"
          </div>
        `;
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
