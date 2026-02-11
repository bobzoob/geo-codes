//import type { ComponentType } from "react";
import type { HistoricalFeature, EntityMap } from "./geojson";
import type { FieldMapping } from "./config";
import type { LayerConfig } from "./state";

export type FilterValue = any;

export type FilterPredicate = (
  feature: HistoricalFeature,
  value: FilterValue,
  entities: EntityMap,
  mapping: FieldMapping,
  layer: LayerConfig,
  params?: Record<string, any>
) => boolean;

// UI Component props
export interface FilterComponentProps {
  layerId: string;
  value: FilterValue;
  label?: string;

  onChange: (newValue: FilterValue) => void;
  params?: Record<string, any>;
}

// THE CONTRACT
export interface FilterModule {
  id: string;
  label: string; // internal use or debugging
  // component: ComponentType<FilterComponentProps>;
  component: React.ComponentType<any>;
  predicate: FilterPredicate;
  defaultValue: FilterValue;
  formatValue: (value: any, params?: Record<string, any>) => string;
}
