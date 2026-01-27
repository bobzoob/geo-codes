import type { HistoricalFeatureCollection, EntityMap } from "./geojson";
import type { ProcessorConfig } from "./processor";
export type { FilterValue, FilterComponentProps } from "./filter";

// basic types
export type TimeRange = [number, number];
export type View = "dashboard" | "map" | "documentation";
export type FilterPlacement = "timeline-area" | "search-area";
export type FilterState = Record<string, any>;

export interface LayerComponentProps {
  id: string;
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
  entities: EntityMap;
  intensityField?: string; // conrol point size
  styleConfig?: PointStyleConfig;
}

export type PopupFieldType =
  | "header" // main title
  | "text" // simple text
  | "long-text"
  | "tags" // comma separated values ( Mentions: A, B, C)
  | "list" // vertical list (Born: A, B)
  | "timed-list" // complex list (list with differnt values: Person (Date))
  | "feature-list"; // clickable list (generic)

export interface PopupFieldConfig {
  field: string; // key in the GeoJSON properties ("born", "activity_log")
  label?: string; // label to show ("Born:")
  type: PopupFieldType;
  resolveEntities?: boolean; // if: look up GND IDs in dictionary
  entityTypeFilter?: string;

  //for feature-list only
  listLabelField?: string; // featurs shown in list
  detailLayerId?: string; // which laysers popup should be used

  // for linkable entities
  isLinkable?: boolean;
  linkTemplate?: string; // if field is not an entitie but an ID string ("fud")
}

export interface PointStyleConfig {
  // Color: can be a single hex string or an array for a gradient ramp
  color?: string | string[];
  // Radius: can be a single number or a min/max array
  radius?: number | [number, number];

  opacity?: number;

  strokeColor?: string;
}

export interface LayerConfig {
  id: string;
  name: string;
  description?: string;
  visible: boolean;
  showInPanel?: boolean;
  type: string;
  source: string;
  showAllTooltips?: boolean;

  hasFlashlight?: boolean; // removes the showAllTooltips Option

  // processor
  processor?: ProcessorConfig;

  // cicrle radius
  intensityField?: string;

  // some layers may not be bound to the timline, they ignore it
  ignoreTimeFilter?: boolean;

  // the current values of the filters ("text": "Goethe", "date": "1800" )
  filterValues?: FilterState;

  // which filters are active for this layer?
  activeFilters: {
    moduleId: string; // references the ID in the registry
    placement: FilterPlacement;
    section?: "advanced"; // optional fold out section
  }[];

  popupConfig: PopupFieldConfig[];

  // poit styling
  styleConfig?: PointStyleConfig;
}

// interface that structures the data pipline
export interface AppState {
  currentView: View;

  // raw data
  geoJsonData: Record<string, HistoricalFeatureCollection> | null;
  entities: EntityMap;

  //processed data
  processedData: Record<string, HistoricalFeatureCollection>;

  // control state
  layerConfig: LayerConfig[];
  committedTimeRange: TimeRange;
  liveTimeRange: TimeRange;
  selectedLayerId: string | null;
  // UI state
  isLayerPanelCollapsed: boolean;
  isOptionsPanelCollapsed: boolean;
  isActiveFiltersPanelCollapsed: boolean;
  activeMobilePanel: "layers" | "options" | "filters" | "none";
  loadingProgress: number;
}
