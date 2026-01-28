import type { ComponentType } from "react";
import type { HistoricalFeature, EntityMap } from "./geojson";

export type FilterValue = any;

export type FilterPredicate = (
  feature: HistoricalFeature,
  value: FilterValue,
  entities: EntityMap
) => boolean;

// UI Component props
export interface FilterComponentProps {
  layerId: string;
  value: FilterValue;
  label?: string;

  onChange: (newValue: FilterValue) => void;
}

// THE CONTRACT
export interface FilterModule {
  id: string;
  label: string; // internal use or debugging
  component: ComponentType<FilterComponentProps>;
  predicate: FilterPredicate;
  defaultValue: FilterValue;
}
