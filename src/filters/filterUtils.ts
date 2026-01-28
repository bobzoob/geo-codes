import type { HistoricalFeature, EntityMap } from "../types/geojson";
import type { TimeRange, LayerConfig } from "../types/state";
import { filterRegistry } from "./filterRegistry";

// Helper to extract year from "YYYY-MM-DD" or "YYYY"
const getYear = (dateStr?: string | null): number => {
  if (!dateStr) return 0;
  const yearPart = dateStr.split("-")[0];
  return parseInt(yearPart, 10) || 0;
};

// Helper for global timeline
const filterByGlobalTime = (
  feature: HistoricalFeature,
  range: TimeRange
): boolean => {
  const props = feature.properties;
  const [minYear, maxYear] = range;

  // we check if any year is within the slider range
  if (props.active_years && Array.isArray(props.active_years)) {
    return props.active_years.some(
      (year: number) => year >= minYear && year <= maxYear
    );
  }

  // we check for a point in time
  // date_start -> date_end -> date_sort
  const startDateStr = props.date_start || props.date_sort;

  if (startDateStr) {
    const startYear = getYear(startDateStr);
    // ff date_end exists, we use it otherwise: end = start
    const endYear = props.date_end ? getYear(props.date_end) : startYear;
    // check for invalid dates
    if (startYear === 0) return false;

    // if there is a overlap
    return startYear <= maxYear && endYear >= minYear;
  }
  return false;
};

export const applyFilters = (
  feature: HistoricalFeature,
  globalTimeRange: TimeRange,
  entities: EntityMap,
  layerConfig: LayerConfig
): boolean => {
  // Global Time Check
  if (!layerConfig.ignoreTimeFilter) {
    if (!filterByGlobalTime(feature, globalTimeRange)) return false;
  }
  // Dynamic Filter Check
  const filters = layerConfig.activeFilters || [];
  const values = layerConfig.filterValues || {};
  for (const filterConfig of filters) {
    const module = filterRegistry[filterConfig.moduleId];
    if (!module) continue;

    const value = values[module.id] ?? module.defaultValue;

    if (!module.predicate(feature, value, entities)) {
      return false;
    }
  }

  return true;
};
