import { GeoJSON } from "react-leaflet";
import type {
  HistoricalFeature,
  HistoricalFeatureCollection,
} from "../types/geojson";
import type { Layer } from "leaflet";

interface GeoJSONLayerProps {
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
}

function GeoJSONLayer({ data, showAllTooltips }: GeoJSONLayerProps) {
  // onEachFeature is a hook function by leaflet. it wil run once for every single feature in the GeoJSON data
  const onEachFeature = (feature: HistoricalFeature, layer: Layer) => {
    if (feature.properties) {
      const { name, description } = feature.properties;

      const popupContent = `
        <strong>${name}</strong>
        <p>${description}</p>
      `;
      layer.bindPopup(popupContent);

      layer.bindTooltip(name, { permanent: showAllTooltips });
    }
  };

  return (
    <GeoJSON
      // key prop is a must have for React to know when to re-render the layer: when data changes
      // but we handle this in the parent MapContainer
      // key={timeRangeKey.join("-")}
      data={data}
      onEachFeature={onEachFeature}
    />
  );
}

export default GeoJSONLayer;
