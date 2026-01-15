import type { ComponentType } from "react";
import type { HistoricalFeature, EntityMap } from "./geojson";

// The value managed by a filter (string, number, object, etc.)
export type FilterValue = any;

// The function that decides if a feature stays or goes
export type FilterPredicate = (
  feature: HistoricalFeature,
  value: FilterValue,
  entities: EntityMap
) => boolean;

// The UI Component props
export interface FilterComponentProps {
  layerId: string;
  value: FilterValue;
  label?: string;

  onChange: (newValue: FilterValue) => void;
}

// THE CONTRACT
export interface FilterModule {
  id: string;
  label: string; // For internal use or debugging
  component: ComponentType<FilterComponentProps>;
  predicate: FilterPredicate;
  defaultValue: FilterValue;
}
