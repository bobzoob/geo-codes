import type { ComponentType } from "react";
import type { LayerConfig as LayerConfigBase } from "./state";
import type { HistoricalFeatureCollection, EntityMap } from "./geojson";

// basic types
export type TimeRange = [number, number];
export type View = "dashboard" | "map";
export type FilterPlacement = "timeline-area" | "search-area";

export interface SearchState {
  plainText: string;
  sender: string;
  recipient: string;
  location: string;
  searchStartDate?: string; // 'YYYY-MM-DD'
  searchEndDate?: string;
}

// props that any custom FilterComponent must accept
export interface FilterComponentProps {
  layer: LayerConfigBase; // here we are passing the entire layer config to the component
}

export interface LayerConfig {
  id: string;
  name: string;
  visible: boolean;
  type: string;
  source: string;
  showAllTooltips: boolean;
  search?: SearchState;
  // this is a an optional React component that accepts FilterComponentProps
  FilterComponents?: ComponentType<FilterComponentProps>[];
}
export interface FilterModule {
  component: ComponentType<FilterComponentProps>;
  placement: FilterPlacement;
}

export interface LayerConfig {
  id: string;
  name: string;
  description?: string;
  visible: boolean;
  type: string;
  source: string;
  showAllTooltips: boolean;
  search?: SearchState;
  // to arrange modules on panels
  filters?: FilterModule[];
}

export interface LayerComponentProps {
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
  entities: EntityMap;
}
