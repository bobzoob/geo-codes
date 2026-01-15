import { useMemo } from "react";
import type {
  HistoricalFeatureCollection,
  HistoricalFeature,
} from "../types/geojson";
import type { LayerConfig, TimeRange } from "../types/state";
import { applyFilters } from "../filters/filterUtils";
import { layerRegistry } from "../layers/layerRegistry";
import { useAppState } from "../state/appContext";

interface LayerWrapperProps {
  layer: LayerConfig;
  data: HistoricalFeatureCollection;
  timeRange: TimeRange;
}

export function LayerWrapper({ layer, data, timeRange }: LayerWrapperProps) {
  const { state } = useAppState();
  const { entities } = state;

  // filter data (and memoiz for performance)
  const filteredData = useMemo(() => {
    const filteredFeatures = data.features.filter(
      (feature: HistoricalFeature) =>
        applyFilters(feature, timeRange, entities, layer)
    );
    return {
      ...data,
      features: filteredFeatures,
    };
  }, [data, timeRange, layer.filterValues, entities, layer]);

  // find plugin in Registry
  const plugin = layerRegistry[layer.type];

  if (!plugin) {
    console.warn(`No plugin found for layer type: ${layer.type}`);
    return null;
  }

  // get component from Plugin definition
  const LayerComponent = plugin.Component;

  // render
  return (
    <LayerComponent
      id={layer.id}
      data={filteredData}
      showAllTooltips={layer.showAllTooltips}
      entities={entities}
      intensityField={layer.intensityField}
    />
  );
}
