import type { HistoricalFeatureCollection } from "../types/geojson";
import type { LayerConfig, TimeRange } from "../types/state";
import { applyFilters } from "../utils/filterUtils";
import { layerRegistry } from "../layers/layerRegistry";

interface LayerManagerProps {
  layers: LayerConfig[];
  data: Record<string, HistoricalFeatureCollection> | null;
  timeRange: TimeRange;
}

function LayerManager({ layers, data, timeRange }: LayerManagerProps) {
  if (!data) return null;

  return (
    <>
      {layers.map((layer) => {
        if (!layer.visible) {
          return null;
        }

        const layerData = data[layer.id];
        if (!layerData) return null;

        // filtering logic
        const filteredFeatures = layerData.features.filter((feature) =>
          applyFilters(feature, timeRange, layer.search)
        );

        const filteredData = {
          ...layerData,
          features: filteredFeatures,
        };

        // dynamic rendering
        // look up the component in the registry using the type of the layer
        const LayerComponent = layerRegistry[layer.type];

        // if no component is found render nothing + warning
        if (!LayerComponent) {
          console.warn(`No renderer found for layer type: "${layer.type}"`);
          return null;
        }

        // if a component is found, render with the required props
        const dynamicKey = `${layer.id}-${timeRange.join("-")}-${
          layer.showAllTooltips
        }`;

        return (
          <LayerComponent
            key={dynamicKey}
            data={filteredData}
            showAllTooltips={layer.showAllTooltips}
          />
        );
      })}
    </>
  );
}

export default LayerManager;
