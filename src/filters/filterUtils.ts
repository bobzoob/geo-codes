import type { HistoricalFeature, EntityMap } from "../types/geojson";
import type { TimeRange, LayerConfig } from "../types/state";
import { filterRegistry } from "./filterRegistry";
import type { FieldMapping } from "../types/config";

/**
 * HELPER: Resolves fallback chains for ANY mapped field
 * e.g., mappingKey = ["date_start", "date_sort"]
 */
export const resolveMappedField = (
  feature: HistoricalFeature,
  mappingKey: string | string[] | undefined
): any => {
  if (!mappingKey) return null;

  const keys = Array.isArray(mappingKey) ? mappingKey : [mappingKey];

  for (const key of keys) {
    const val = feature.properties[key] ?? (feature as any)[key];
    if (val !== null && val !== undefined && val !== "") {
      return val;
    }
  }
  return null;
};

// Helper to extract year from "YYYY-MM-DD" or "YYYY"
const getYear = (dateVal?: string | number | null): number => {
  if (dateVal === undefined || dateVal === null) return 0;
  // if already a number
  if (typeof dateVal === "number") return dateVal;
  // but if string
  const yearPart = String(dateVal).split("-")[0];
  return parseInt(yearPart, 10) || 0;
};

// Helper for global timeline
const filterByGlobalTime = (
  feature: HistoricalFeature,
  range: TimeRange,
  mapping: FieldMapping
): boolean => {
  const [minYear, maxYear] = range;

  // 1. Resolve dates using the fallback chain helper!
  const startDateStr = resolveMappedField(feature, mapping.dateStart);
  const endDateStr =
    resolveMappedField(feature, mapping.dateEnd) || startDateStr;

  if (startDateStr) {
    const startYear = getYear(startDateStr);
    const endYear = endDateStr ? getYear(endDateStr) : startYear;

    // check for invalid dates
    if (startYear === 0) return false;

    // if there is an overlap with the slider range
    return startYear <= maxYear && endYear >= minYear;
  }

  // If no date is found at all, it falls outside the timeline
  return false;
};

// MAIN BRIDGE
export const applyGenericFilters = (
  feature: HistoricalFeature,
  globalTimeRange: TimeRange,
  entities: EntityMap,
  layer: LayerConfig,
  mapping: FieldMapping
): boolean => {
  // Global Time Filter
  // applied to any filter unless ignoreTimeFilter = true
  if (!layer.ignoreTimeFilter) {
    if (!filterByGlobalTime(feature, globalTimeRange, mapping)) {
      return false;
    }
  }

  // PLUGIN FILTER, registry-based
  const activeFilters = layer.activeFilters || [];
  const values = layer.filterValues || {};

  for (const filterConfig of activeFilters) {
    const module = filterRegistry[filterConfig.moduleId];
    if (!module) continue;

    const value = values[module.id] ?? module.defaultValue;
    // we execute predicate with the mapping
    if (!module.predicate(feature, value, entities, mapping, layer)) {
      return false;
    }
  }

  return true;
};
