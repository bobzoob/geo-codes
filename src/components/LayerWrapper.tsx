import { useMemo } from "react";
import type {
  HistoricalFeatureCollection,
  HistoricalFeature,
} from "../types/geojson";
import type { LayerConfig, TimeRange } from "../types/state";
import { applyFilters } from "../filters/filterUtils";
import { layerRegistry } from "../layers/layerRegistry";
import { processorRegistry } from "../processors/processorRegistry";
import { useAppState } from "../state/appContext";

/**
 * applications engine room,
 * takes raw data
 * wrapps them so the map can draw them
 *
 *  */
interface LayerWrapperProps {
  layer: LayerConfig;
  data: HistoricalFeatureCollection;
  timeRange: TimeRange;
}

export function LayerWrapper({ layer, data, timeRange }: LayerWrapperProps) {
  const { state } = useAppState();
  const { entities } = state;

  // processed data (for data sometimes needs pre-processing aka is_local)
  // now, i used useMemo here, which is not the best choice

  const processedData = useMemo(() => {
    //FILTER
    // const activeFilterValues = layer.filterValues || {};
    const filteredFeatures = data.features.filter((f: HistoricalFeature) =>
      applyFilters(f, timeRange, entities, {
        ...layer,
        filterValues: layer.filterValues || {},
      })
    );

    //PROCESSING
    // agregate data with generic processor
    if (layer.processor) {
      const processorModule = processorRegistry[layer.processor.type];
      if (processorModule) {
        return processorModule.execute(
          filteredFeatures,
          layer.processor.params,
          entities
        );
      } else {
        console.warn(`Processor not found: ${layer.processor.type}`);
      }
    }

    // DEFAULT
    return {
      ...data,
      features: filteredFeatures,
    };
  }, [data, timeRange, layer.filterValues, entities, layer.processor]);

  // FIND RENDERING PLUG-IN

  const plugin = layerRegistry[layer.type];

  if (!plugin) {
    console.warn(`No plugin found for layer type: ${layer.type}`);
    return null;
  }

  const LayerComponent = plugin.Component;

  return (
    <LayerComponent
      id={layer.id}
      data={processedData}
      // fallback: optional config values
      showAllTooltips={layer.showAllTooltips ?? false} //Nullish Coalescing Operator (??)
      entities={entities}
      intensityField={layer.intensityField}
      styleConfig={layer.styleConfig}
    />
  );
}
