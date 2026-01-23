import { Feature, GeoJsonProperties, Geometry } from "geojson";

// *
// Here we only define the general structure of GeoJSON data
// we set up generic types here
// contract: every file MUST have these properties
// layers.ts is our SCHEMA and tells the app what exact properties they are
// ADD LOGIC IN filterRegistry.ts
//*

export interface Entity {
  name: string;
  type?: string;
  class?: string;
  authority?: {
    gnd?: string;
    geonames?: string;
    [key: string]: any; // we allow extra entity fields here too
  };
  [key: string]: any;
}

// map of keys (id) and obejects (enteties)
export type EntityMap = Record<string, Entity>;
export interface HistoricalFeatureProperties {
  id?: string;
  title?: string;

  // time
  date_start?: string;
  date_end?: string;
  date_sort?: string;
  active_years?: number[];

  // styling
  weight?: number;

  //  "Index Signature"
  // meening: this object can have ANY other property with a string key
  // This allows 'sender_ids', 'born', 'died', 'is_local' without defining them here
  [key: string]: any;
}

// single feature (line, point)
export type HistoricalFeature = Feature<
  Geometry | null,
  HistoricalFeatureProperties
>;

// collections of features
export type HistoricalFeatureCollection = FeatureCollection<
  Geometry | null,
  HistoricalFeatureProperties
>;
