import { useAppState } from "../state/appContext";
import { filterRegistry } from "../filters/filterRegistry";
import { APP_CONFIG } from "../config/appConfig";

/**
 * tells the ActiveFiltersPanel how to handle the logic and
 * provides a formatted list of all currently active filters
 * for display in the ActiveFiltersPanel.
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

  // GlobalTime logic
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

  // LayerFilters logic
  const selectedLayer = layerConfig.find((l) => l.id === selectedLayerId);

  if (selectedLayer) {
    selectedLayer.activeFilters.forEach((filterConfig) => {
      const module = filterRegistry[filterConfig.moduleId];
      if (!module) return;

      const rawValue = (selectedLayer.filterValues || {})[module.id];
      // we ignore if value is null || undefined
      if (rawValue === null || rawValue === undefined) return;

      // DISPLAY FORMATTING logic
      // DateRange
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
      // Standard string (sender, recipiant)
      else if (typeof rawValue === "string" && rawValue.trim() !== "") {
        items.push({
          id: module.id,
          label: module.label,
          value: `"${rawValue}"`,
        });
      }

      // Special { searchTerm, onlyResolved etc}
      else if (module.id === "placeFilter" && typeof rawValue === "object") {
        const { searchTerm, onlyResolved } = rawValue;

        if (!searchTerm && !onlyResolved) return; // if they are not active

        const displayParts = [];
        if (searchTerm) {
          displayParts.push(`"${searchTerm}"`);
        }

        // this is for **development purposes** only,
        // will be dismissed in production
        if (onlyResolved) {
          displayParts.push("Resolved Only");
        }

        items.push({
          id: module.id,
          label: module.label,
          value: displayParts.join(" + "),
        });
      }
    });
  }

  return items;
}
