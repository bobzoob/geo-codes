import type { HistoricalFeature, EntityMap } from "../types/geojson";
import type { TimeRange, LayerConfig } from "../types/state";
import { filterRegistry } from "./filterRegistry";
import type { FieldMapping } from "../types/config";

// Helper to extract year from "YYYY-MM-DD" or "YYYY"
const getYear = (dateVal?: string | number | null): number => {
  if (dateVal === undefined || dateVal === null) return 0;
  // if allready a number
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
  const props = feature.properties;
  const [minYear, maxYear] = range;

  // we check if any year is within the slider range
  // we chack for active_years -> is this generic?
  const activeYears = props.active_years;
  if (activeYears && Array.isArray(activeYears)) {
    return activeYears.some(
      (year: number) => year >= minYear && year <= maxYear
    );
  }

  // we check for a point in time
  const startKey = mapping.dateStart;
  const endKey = mapping.dateEnd || startKey;

  const startDateStr = props[startKey];
  if (startDateStr) {
    const startYear = getYear(startDateStr);
    const endYear = props[endKey] ? getYear(props[endKey]) : startYear;
    // check for invalid dates
    if (startYear === 0) return false;

    // if there is a overlap
    return startYear <= maxYear && endYear >= minYear;
  }
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
  // applied to any filter unless ignoreTimeFiler = true
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
    // we executre predicate with the mapping
    if (!module.predicate(feature, value, entities, mapping, layer)) {
      return false;
    }
  }

  return true;
};
