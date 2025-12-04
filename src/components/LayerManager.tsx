import type { HistoricalFeatureCollection } from "../types/geojson";
import type { LayerConfig, TimeRange } from "../types/state";
import { applyFilters } from "../filters/filterUtils";
import { layerRegistry } from "../layers/layerRegistry";
import { useAppState } from "../state/appContext";

interface LayerManagerProps {
  layers: LayerConfig[];
  data: Record<string, HistoricalFeatureCollection> | null;
  timeRange: TimeRange;
}

function LayerManager({ layers, data, timeRange }: LayerManagerProps) {
  const { state } = useAppState();
  const { entities } = state;

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
          applyFilters(feature, timeRange, entities, layer)
        );

        const filteredData = {
          ...layerData,
          features: filteredFeatures,
        };

        // dynamic rendering
        // look up the component in the registry using the type of the layer
        const LayerComponent = layerRegistry[layer.type];

        // if no component is found render nothing
        if (!LayerComponent) {
          console.warn(`No renderer found for layer type: "${layer.type}"`);
          return null;
        }
        // Create a unique key that changes when filters change
        // We stringify the filterValues to ensure re-render on filter update
        const filterKey = JSON.stringify(layer.filterValues);

        // if a component is found, render with the required props
        const dynamicKey = `${layer.id}-${timeRange.join("-")}-${filterKey}`;

        return (
          <LayerComponent
            key={dynamicKey}
            data={filteredData}
            showAllTooltips={layer.showAllTooltips}
            entities={entities}
          />
        );
      })}
    </>
  );
}

export default LayerManager;
