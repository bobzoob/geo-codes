import type { AppState } from "../types/state";
import type {
  HistoricalFeature,
  HistoricalFeatureCollection,
} from "../types/geojson";
import { applyFilters } from "../filters/filterUtils";
import { processorRegistry } from "../processors/processorRegistry";
import { APP_CONFIG } from "../config/appConfig";

/**
 * ENGINE ROOM
 * this function transforms raw GeoJSON into the final data used by the Map and UI.
 * It follows this pipeline: Filter -> Sanitize -> Process.
 */

export const computeProcessedData = (
  state: AppState
): Record<string, HistoricalFeatureCollection> => {
  const { geoJsonData, layerConfig, committedTimeRange, dictionaries } = state;
  const results: Record<string, HistoricalFeatureCollection> = {};

  // Initialize results for all configured layers
  layerConfig.forEach((layer) => {
    results[layer.id] = {
      type: "FeatureCollection",
      features: [],
    };
  });

  // guard: wait till data is loaded
  if (!geoJsonData) return results;

  // default dicitionary: first in list
  // used for layers that do not specify theire dict
  const defaultDictionaryId = APP_CONFIG.dictionaries?.[0]?.id;

  layerConfig.forEach((layer) => {
    const rawData = geoJsonData[layer.id];
    if (!rawData) return;

    // DICTIONARY SECTION
    const dictionaryId = layer.dictionaryId || defaultDictionaryId;
    const relevantDictionary = dictionaryId ? dictionaries[dictionaryId] : {};

    // Safety check in case of misconfiguration
    if (dictionaryId && !dictionaries[dictionaryId]) {
      console.warn(
        `Dictionary with ID "${dictionaryId}" not found for layer "${layer.id}". Using an empty dictionary.`
      );
    }

    // FILTERING SECTION
    // run predicates defined in the FilterRegistry (dateRange, textSearch, localOnly)
    const filteredFeatures = rawData.features.filter(
      (feature: HistoricalFeature) =>
        applyFilters(
          feature,
          committedTimeRange,
          relevantDictionary || {},
          layer
        )
    );

    // SANITIZATION & ID PROMOTION SECTION
    // we ensure every feature has a string ID
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
          id: stringId,
          properties: {
            ...f.properties,
            id: stringId,
          },
        };
      }
    );

    // PROCESSING (AGGREGATION) SECTION
    // if the researcher defined a processor (like 'aggregateByProperty'), we run it now.
    // because we run this AFTER filtering, the aggregation is reactive to the timeline.
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
          relevantDictionary || {}
        );

        // processors output must follows the ID promotion rule
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

    // save
    results[layer.id] = processedCollection;
  });

  return results;
};
