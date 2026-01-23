import type {
  HistoricalFeature,
  HistoricalFeatureCollection,
  EntityMap,
} from "./geojson";

// this type holds the configaration for a processor (defined in layer.ts)
// that groups values and data to new feature collections

export interface ProcessorConfig {
  type: string; // name of the function
  params: Record<string, any>; // groupBy: "origin_id" for example
}

export type ProcessorFunction = (
  features: HistoricalFeature[],
  params: Record<string, any>,
  entities: EntityMap
) => HistoricalFeatureCollection;

export interface ProcessorModule {
  id: string;
  execute: ProcessorFunction;
}
