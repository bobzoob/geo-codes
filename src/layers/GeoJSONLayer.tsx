import { GeoJSON } from "react-leaflet";
import type {
  HistoricalFeature,
  HistoricalFeatureCollection,
  EntityMap,
} from "../types/geojson";
import type { Layer } from "leaflet";
import type { Feature } from "geojson";

interface GeoJSONLayerProps {
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
  entities: EntityMap;
}

function GeoJSONLayer({ data, showAllTooltips, entities }: GeoJSONLayerProps) {
  // Helper to resolve entity labels from IDs
  const resolveMentions = (ids?: string[]) => {
    if (!ids || ids.length === 0) return "";
    return ids
      .map((id) => entities[id]?.label)
      .filter(Boolean)
      .join(", ");
  };

  // onEachFeature is a hook function by leaflet. it wil run once for every single feature in the GeoJSON data
  const onEachFeature = (feature: Feature, layer: Layer) => {
    const historicalFeature = feature as HistoricalFeature;
    const props = historicalFeature.properties;

    if (props) {
      // 1. Determine Title (New format -> Old format fallback)
      const title = props.title || props.name || "Untitled";

      // 2. Resolve Mentions (New format) or PlaceId (Old format)
      let contextInfo = "";

      if (props.mentions && props.mentions.length > 0) {
        const names = resolveMentions(props.mentions);
        if (names) contextInfo = `<em>Mentions: ${names}</em><br/>`;
      } else if (props.placeId && entities[props.placeId]) {
        contextInfo = `<em>(${entities[props.placeId].label})</em><br/>`;
      }

      // 3. Determine Description/Text
      const description = props.full_text || props.description || "";
      const dateDisplay = props.date_start
        ? `<strong>Date:</strong> ${props.date_start}<br/>`
        : "";

      // 4. Build Popup HTML
      const popupContent = `
        <strong>${title}</strong><br/>
        ${dateDisplay}
        ${contextInfo}
        <hr/>
        <div style="max-height: 200px; overflow-y: auto;">
          ${description}
        </div>
        ${
          props.url
            ? `<br/><a href="${props.url}" target="_blank">More Info</a>`
            : ""
        }
      `;

      layer.bindPopup(popupContent);

      // Only bind tooltip if we have a title
      if (title) {
        layer.bindTooltip(title, { permanent: showAllTooltips });
      }
    }
  };

  const safeEntities = entities || {};

  return (
    <GeoJSON
      // key prop is a must have for React to know when to re-render the layer: when data changes
      // but we handle this in the parent MapContainer
      // key={timeRangeKey.join("-")}
      key={`geojson-${Object.keys(safeEntities).length}`}
      data={data}
      onEachFeature={onEachFeature}
    />
  );
}

export default GeoJSONLayer;
