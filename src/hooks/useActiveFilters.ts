import { useAppState } from "../state/appContext";
import { filterRegistry } from "../filters/filterRegistry";
import { APP_CONFIG } from "../config/appConfig";

/**
 * tells the ActiveFiltersPanel how to handle the logic
 */

export interface ActiveFilterItem {
  id: string;
  label: string;
  value: string;
}

export function useActiveFilters() {
  const { state } = useAppState();
  const { layerConfig, selectedLayerId, committedTimeRange } = state;

  const items: ActiveFilterItem[] = [];

  // 1. Global Time Logic
  const isTimeFiltered =
    committedTimeRange[0] !== APP_CONFIG.timeRange.min ||
    committedTimeRange[1] !== APP_CONFIG.timeRange.max;

  if (isTimeFiltered) {
    items.push({
      id: "global-time",
      label: "Global Time",
      value: `${committedTimeRange[0]} - ${committedTimeRange[1]}`,
    });
  }

  // 2. Layer Filters Logic
  const selectedLayer = layerConfig.find((l) => l.id === selectedLayerId);

  if (selectedLayer) {
    selectedLayer.activeFilters.forEach((filterConfig) => {
      const module = filterRegistry[filterConfig.moduleId];
      if (!module) return;

      const rawValue = (selectedLayer.filterValues || {})[module.id];
      if (!rawValue) return;

      // --- Formatting Logic ---

      // A. Date Range Formatting
      if (module.id === "dateRange") {
        const { start, end } = rawValue;
        if (!start && !end) return;

        let displayValue = "";
        if (start && end) displayValue = `${start} to ${end}`;
        else if (start) displayValue = `After ${start}`;
        else if (end) displayValue = `Before ${end}`;

        items.push({
          id: module.id,
          label: module.label,
          value: displayValue,
        });
      }
      // B. Standard String Formatting
      else if (typeof rawValue === "string" && rawValue.trim() !== "") {
        items.push({
          id: module.id,
          label: module.label,
          value: `"${rawValue}"`,
        });
      }
    });
  }

  return items;
}
