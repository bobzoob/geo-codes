import { useAppState } from "../state/appContext";
import { filterRegistry } from "../filters/filterRegistry";

/**
 * tells the ActiveFiltersPanel how to handle the logic and
 * provides a formatted list of all currently active filters
 * for display in the ActiveFiltersPanel.
 * relies on FilterRegistry to handle formatting logic
 */

export interface ActiveFilterItem {
  id: string;
  label: string;
  value: string;
  moduleId: string;
  layerId?: string;
}

export function useActiveFilters() {
  const { state } = useAppState();
  const { layerConfig, selectedLayerId, committedTimeRange, settings } = state;

  const items: ActiveFilterItem[] = [];

  // GlobalTime logic
  const [min, max] = [settings.timeRange.min, settings.timeRange.max];
  if (committedTimeRange[0] !== min || committedTimeRange[1] !== max) {
    items.push({
      id: "global-time-item",
      label: "Global Time",
      value: `${committedTimeRange[0]} - ${committedTimeRange[1]}`,
      moduleId: "global-time", // zhis is the special ID for the reducer
    });
  }
  // layer specific filters
  const selectedLayer = layerConfig.find((l) => l.id === selectedLayerId);
  if (selectedLayer?.filterValues) {
    selectedLayer.activeFilters.forEach((config) => {
      const module = filterRegistry[config.moduleId];
      const val = selectedLayer.filterValues![config.moduleId];

      const isDefault =
        JSON.stringify(val) === JSON.stringify(module.defaultValue);

      if (module && val !== undefined && !isDefault) {
        items.push({
          id: `${selectedLayer.id}-${config.moduleId}`,
          label: config.params?.activeLabel || module.label,
          value: module.formatValue(val, config.params),
          moduleId: config.moduleId,
          layerId: selectedLayer.id,
        });
      }
    });
  }

  return items;
}
