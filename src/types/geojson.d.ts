import { Feature, GeoJsonProperties, Geometry } from "geojson";

// to enrich the dataformat we set up a new type here
// here we defining the structure: *this* specific GeoJSON data will have, every file MUST have these properties
export interface HistoricalFeatureProperties extends GeoJsonProperties {
  name: string;
  description: string;
  startDate: string; // ISO 8601 format "YYYY-MM-DD"
  endDate: string;
  sender?: string;
  recipient?: string;

  place?: string;
  sourcePlace?: string;
  destinationPlace?: string;
}

// this is a generic TypeScript feature we create, that MUST have a geometry and MUST match the structure of the interface above
export interface HistoricalFeature
  extends Feature<Geometry, HistoricalFeatureProperties> {
  properties: HistoricalFeatureProperties;
}

// define a FeatureCollection for this type
export interface HistoricalFeatureCollection {
  type: "FeatureCollection";
  features: HistoricalFeature[];
}
