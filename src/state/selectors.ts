import type { AppState } from "../types/state";
import type {
  HistoricalFeature,
  HistoricalFeatureCollection,
} from "../types/geojson";
import { applyFilters } from "../filters/filterUtils";
import { processorRegistry } from "../processors/processorRegistry";

/**
 * ENGINE ROOM
 * this function transforms raw GeoJSON into the final data used by the Map and UI.
 * It follows this pipeline: Filter -> Sanitize -> Process.
 */

export const computeProcessedData = (
  state: AppState
): Record<string, HistoricalFeatureCollection> => {
  const { geoJsonData, layerConfig, committedTimeRange, entities } = state;
  const results: Record<string, HistoricalFeatureCollection> = {};

  // Initialize results for all configured layers
  layerConfig.forEach((layer) => {
    results[layer.id] = {
      type: "FeatureCollection",
      features: [],
    };
  });

  if (!geoJsonData) return results;

  layerConfig.forEach((layer) => {
    const rawData = geoJsonData[layer.id];
    if (!rawData) return;

    // --- STEP 1: FILTERING ---
    // We run the predicates defined in the FilterRegistry (e.g., dateRange, textSearch, localOnly)
    const filteredFeatures = rawData.features.filter(
      (feature: HistoricalFeature) =>
        applyFilters(feature, committedTimeRange, entities, layer)
    );

    // --- STEP 2: SANITIZATION & ID PROMOTION ---
    // This is the "Core" fix for MapLibre. We ensure every feature has a string ID
    // at the root AND inside properties so 'promoteId="id"' always works.
    const sanitizedFeatures: HistoricalFeature[] = filteredFeatures.map(
      (f: HistoricalFeature, index: number) => {
        const rawId =
          f.id ??
          f.properties?.id ??
          f.properties?.letter_id ??
          f.properties?.GND;

        // Fallback to a stringified index if no ID exists, but usually historical data has one
        const stringId =
          rawId !== undefined ? String(rawId) : `auto-${layer.id}-${index}`;

        return {
          ...f,
          id: stringId, // Used by React and Selector lookups
          properties: {
            ...f.properties,
            id: stringId, // Used by MapLibre (promoteId="id")
          },
        };
      }
    );

    // --- STEP 3: PROCESSING (AGGREGATION) ---
    // If the researcher defined a processor (like 'aggregateByProperty'), we run it now.
    // Because we run this AFTER filtering, the aggregation is reactive to the timeline.
    let processedCollection: HistoricalFeatureCollection = {
      type: "FeatureCollection",
      features: sanitizedFeatures,
    };

    if (layer.processor) {
      const processorModule = processorRegistry[layer.processor.type];
      if (processorModule) {
        processedCollection = processorModule.execute(
          sanitizedFeatures,
          layer.processor.params,
          entities
        );

        // Ensure the processor's output also follows the ID promotion rule
        processedCollection.features = processedCollection.features.map(
          (f: HistoricalFeature) => ({
            ...f,
            id: String(f.id),
            properties: {
              ...f.properties,
              id: String(f.id),
            },
          })
        );
      }
    }

    // Save the final result for this layer
    results[layer.id] = processedCollection;
  });

  return results;
};
