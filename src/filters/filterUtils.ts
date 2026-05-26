import type { HistoricalFeature, EntityMap } from "../types/geojson";
import type { TimeRange, LayerConfig } from "../types/state";
import { filterRegistry } from "./filterRegistry";
import type { FieldMapping } from "../types/config";

/**
 * HELPER: Resolves fallback chains for ANY mapped field
 * like the mappingKey = ["date_start", "date_sort"]
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

  // resolve dates using the fallback chain helper!
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

// GROUP FILTER
export const evaluateBaseFilter = (
  feature: any,
  filter?: any,
  referenceFeature?: any //for dynamic grouping
): boolean => {
  if (!filter) return true;

  // RECURSIVE LOGIC (AND / OR)
  if ("logic" in filter && filter.logic) {
    if (filter.logic === "OR" && Array.isArray(filter.conditions)) {
      return filter.conditions.some((cond: any) =>
        evaluateBaseFilter(feature, cond, referenceFeature)
      );
    }
    if (filter.logic === "AND" && Array.isArray(filter.conditions)) {
      return filter.conditions.every((cond: any) =>
        evaluateBaseFilter(feature, cond, referenceFeature)
      );
    }
    return true;
  }

  // SINGLE CONDITION EVALUATION
  if ("field" in filter && filter.operator) {
    const { field, operator, value, matchReferenceField } = filter;

    // get the value from the feature being evaluated
    let featVal = feature.properties[field];
    if (
      typeof featVal === "string" &&
      (featVal.startsWith("[") || featVal.startsWith("{"))
    ) {
      try {
        featVal = JSON.parse(featVal);
      } catch (e) {}
    }

    // determine the target value
    // this will be hardcoded in layers config for the layers
    // OR dynamically pulled from referenceFeature for highlighting
    let targetValue = value;
    if (matchReferenceField && referenceFeature) {
      targetValue = referenceFeature.properties[matchReferenceField];
      if (
        typeof targetValue === "string" &&
        (targetValue.startsWith("[") || targetValue.startsWith("{"))
      ) {
        try {
          targetValue = JSON.parse(targetValue);
        } catch (e) {}
      }
    }

    switch (operator) {
      case "eq":
        return featVal === targetValue;
      case "neq":
        return featVal !== targetValue;
      case "gt":
        return featVal > targetValue;
      case "lt":
        return featVal < targetValue;
      case "contains":
        return String(featVal).includes(String(targetValue));
      case "isNull":
        return featVal === null || featVal === undefined || featVal === "";
      case "isNotNull":
        return featVal !== null && featVal !== undefined && featVal !== "";
      case "in": // array intersection
        if (featVal === undefined || featVal === null || featVal === "")
          return false;
        const fArray = Array.isArray(featVal) ? featVal : [featVal];
        const tArray = Array.isArray(targetValue) ? targetValue : [targetValue];
        return fArray.some((v: any) => tArray.includes(v));
      default:
        return true;
    }
  }

  return true;
};
