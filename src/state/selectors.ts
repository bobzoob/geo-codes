import type { AppState } from "../types/state";
import type {
  HistoricalFeature,
  HistoricalFeatureCollection,
} from "../types/geojson";
import { applyGenericFilters } from "../filters/filterUtils";
import { processorRegistry } from "../processors/processorRegistry";

/**
 * ENGINE ROOM
 * this function is blind to the data
 * but uses source mapping to manage GeoJSON data
 * It follows this pipeline: Filter -> Sanitize -> Process
 * transforms raw sources into processed layers
 */

// Helper to handle aggregate(base) locig (like "is_local")
const evaluateBaseFilter = (
  feature: HistoricalFeature,
  filter?: any
): boolean => {
  if (!filter) return true;

  // TYPE GUARD: Is this a LogicalFilter?
  if ("logic" in filter && filter.logic) {
    if (filter.logic === "OR" && Array.isArray(filter.conditions)) {
      return filter.conditions.some((cond: any) =>
        evaluateBaseFilter(feature, cond)
      );
    }
    if (filter.logic === "AND" && Array.isArray(filter.conditions)) {
      return filter.conditions.every((cond: any) =>
        evaluateBaseFilter(feature, cond)
      );
    }
    return true;
  }

  // TYPE GUARD: If its not a LogicalFilter, it MUST be a SingleFilter
  if ("field" in filter && filter.operator) {
    const { field, operator, value } = filter;
    const featVal = feature.properties[field];

    switch (operator) {
      case "eq":
        return featVal === value;
      case "neq":
        return featVal !== value;
      case "gt":
        return featVal > value;
      case "lt":
        return featVal < value;
      case "contains":
        return String(featVal).includes(value);
      case "isNull":
        return featVal === null || featVal === undefined || featVal === "";
      case "isNotNull":
        return featVal !== null && featVal !== undefined && featVal !== "";
      default:
        return true;
    }
  }

  return true;
};

export const computeProcessedData = (
  state: AppState
): Record<string, HistoricalFeatureCollection> => {
  const { rawSources, layerConfig, committedTimeRange, dictionaries, sources } =
    state;
  const results: Record<string, HistoricalFeatureCollection> = {};
  // we inizialize results for all layers
  layerConfig.forEach((layer) => {
    results[layer.id] = { type: "FeatureCollection", features: [] };
  });
  if (!rawSources) return results;

  // and process all layers
  layerConfig.forEach((layer) => {
    const sourceConfig = sources[layer.sourceId];
    const rawData = rawSources[layer.sourceId];

    if (!sourceConfig || !rawData) return;

    const mapping = sourceConfig.mapping;
    const dictionaryId = layer.dictionaryId || sourceConfig.dictionaryId;
    const relevantDictionary = dictionaryId ? dictionaries[dictionaryId] : {};

    // PIPLINE
    const processedFeatures = rawData.features.filter(
      (feature: HistoricalFeature) => {
        // BASE FILTER
        // if this is a base filter feature
        if (!evaluateBaseFilter(feature, layer.baseFilter)) return false;

        // UI MAPPING
        return applyGenericFilters(
          feature,
          committedTimeRange,
          relevantDictionary || {},
          layer,
          mapping
        );
      }
    );
    // ID PROMOTION
    // highlight features using mapped id field
    const sanitizedFeatures: HistoricalFeature[] = processedFeatures.map(
      (f: HistoricalFeature, index: number) => {
        const idKey = mapping.id || "id";
        const stringId = String(f.properties[idKey] || f.id || `auto-${index}`);

        return {
          ...f,
          id: stringId,
          properties: { ...f.properties, id: stringId },
        };
      }
    );

    // PROCESSING
    // final aggregation
    // if the researcher defined a processor (like 'aggregateByProperty'), we run it now.
    // because we run this AFTER filtering, the aggregation is reactive to the timeline.
    let finalCollection: HistoricalFeatureCollection = {
      type: "FeatureCollection",
      features: sanitizedFeatures,
    };

    if (layer.processor) {
      const processorModule = processorRegistry[layer.processor.type];
      if (processorModule) {
        finalCollection = processorModule.execute(
          sanitizedFeatures,
          layer.processor.params,
          relevantDictionary || {}
        );
      }
    }

    results[layer.id] = finalCollection;
  });

  return results;
};
