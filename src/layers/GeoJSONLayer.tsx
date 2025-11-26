import { GeoJSON } from "react-leaflet";
import type {
  HistoricalFeature,
  HistoricalFeatureCollection,
  EntityMap,
} from "../types/geojson";
import type { Layer } from "leaflet";

interface GeoJSONLayerProps {
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
  entities: EntityMap;
}

function GeoJSONLayer({ data, showAllTooltips, entities }: GeoJSONLayerProps) {
  // onEachFeature is a hook function by leaflet. it wil run once for every single feature in the GeoJSON data
  const onEachFeature = (feature: HistoricalFeature, layer: Layer) => {
    if (feature.properties) {
      const { name, description, placeId } = feature.properties;

      // resolve Entity Name if it is there
      const linkedEntityName =
        placeId && entities[placeId] ? entities[placeId].name : "";

      const popupContent = `
        <strong>${name}</strong>
        ${linkedEntityName ? `<br/><em>(${linkedEntityName})</em>` : ""}
        <p>${description || ""}</p>
      `;

      layer.bindPopup(popupContent);
      layer.bindTooltip(name, { permanent: showAllTooltips });
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
