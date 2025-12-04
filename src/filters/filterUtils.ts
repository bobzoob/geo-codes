import type { HistoricalFeature, EntityMap } from "../types/geojson";
import type { TimeRange, LayerConfig } from "../types/state";
import { filterRegistry } from "./filterRegistry";

// Helper for global timeline (still hardcoded as it's a core feature)
const filterByGlobalTime = (
  feature: HistoricalFeature,
  range: TimeRange
): boolean => {
  const year = parseInt(
    feature.properties.date_start?.split("-")[0] || "0",
    10
  );
  if (!year) return false;
  return year >= range[0] && year <= range[1];
};

export const applyFilters = (
  feature: HistoricalFeature,
  globalTimeRange: TimeRange,
  entities: EntityMap,
  layerConfig: LayerConfig
): boolean => {
  // 1. Global Time Check
  if (!filterByGlobalTime(feature, globalTimeRange)) return false;

  // 2. Dynamic Filter Check
  // Iterate over the filters configured for this layer
  for (const filterConfig of layerConfig.activeFilters) {
    const module = filterRegistry[filterConfig.moduleId];

    if (!module) {
      console.warn(`Filter module not found: ${filterConfig.moduleId}`);
      continue;
    }

    // Get the current value from state (or default)
    const value = layerConfig.filterValues[module.id] ?? module.defaultValue;

    // Run the predicate
    // If ANY filter returns false, the feature is hidden
    if (!module.predicate(feature, value, entities)) {
      return false;
    }
  }

  return true;
};
