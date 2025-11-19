import type { ComponentType } from "react";
import type { LayerConfig as LayerConfigBase } from "./state";

// basic types
export type TimeRange = [number, number];
export type View = "dashboard" | "map";

export interface SearchState {
  plainText: string;
  sender: string;
  recipient: string;
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
