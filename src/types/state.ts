import type { HistoricalFeatureCollection, EntityMap } from "./geojson";

export type { FilterValue, FilterComponentProps } from "./filter";

// basic types
export type TimeRange = [number, number];
export type View = "dashboard" | "map";
export type FilterPlacement = "timeline-area" | "search-area";
export type FilterState = Record<string, any>;

export interface LayerComponentProps {
  id: string;
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
  entities: EntityMap;
  intensityField?: string; // conrol point size
}

export type PopupFieldType =
  | "header" // main title
  | "text" // Simple text
  | "long-text" // Text that might need scrolling
  | "tags" // Comma separated values ( Mentions: A, B, C)
  | "list" // Vertical list (Born: A, B)
  | "timed-list"; // Complex list ( Activity Log: Person (Date))

export interface PopupFieldConfig {
  field: string; // key in the GeoJSON properties ("born", "activity_log")
  label?: string; // label to show ("Born:")
  type: PopupFieldType;
  resolveEntities?: boolean; // if: look up GND IDs in dictionary
}

export interface LayerConfig {
  id: string;
  name: string;
  description?: string;
  visible: boolean;
  type: string;
  source: string;
  showAllTooltips: boolean;

  // cicrle radius
  intensityField?: string;

  // some layers may not be bound to the timline, they ignore it
  ignoreTimeFilter?: boolean;

  // the current values of the filters ("text": "Goethe", "date": "1800" )
  filterValues: FilterState;

  // which filters are active for this layer?
  activeFilters: {
    moduleId: string; // references the ID in the registry
    placement: FilterPlacement;
    section?: "advanced"; // optional fold out section
  }[];
  popupConfig: PopupFieldConfig[];
}
