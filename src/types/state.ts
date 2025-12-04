import type { HistoricalFeatureCollection, EntityMap } from "./geojson";

export type { FilterValue, FilterComponentProps } from "./filter";

// basic types
export type TimeRange = [number, number];
export type View = "dashboard" | "map";
export type FilterPlacement = "timeline-area" | "search-area";
export type FilterState = Record<string, any>;

export interface LayerComponentProps {
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
  entities: EntityMap;
}

export interface LayerConfig {
  id: string;
  name: string;
  description?: string;
  visible: boolean;
  type: string;
  source: string;
  showAllTooltips: boolean;

  // The current values of the filters (e.g. { "text": "Goethe", "date": "1800" })
  filterValues: FilterState;

  // Which filters are active for this layer?
  activeFilters: {
    moduleId: string; // References the ID in the Registry
    placement: FilterPlacement;
    section?: "advanced"; // optional fold out section
  }[];
}
