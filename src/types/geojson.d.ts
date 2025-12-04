import { Feature, GeoJsonProperties, Geometry } from "geojson";

// *
// Here we define the structure that *this* specific GeoJSON data will have
// to enrich the dataformat we set up new type here
// every file MUST have these properties
// CHANGE TO YOUR SPECFIC JSON KEYS HERE AND ADD LOGIC IN filterRegistry.ts
//*

export interface Entity {
  // id: string;
  // type: EntityType;
  type: string;
  label: string;
  description?: string;
  //authorityId?: string; // this could also be a  wikidataId, GNDid, URL ...

  authority?: {
    gnd?: string;
    [key: string]: string | undefined;
  };

  // we keep coordinates both in entitiey-data and GEOjson data for performance
  lat?: number;
  lng?: number;
}

//  map id's to entities
export type EntityMap = Record<string, Entity>;

export interface HistoricalFeatureProperties extends GeoJsonProperties {
  id: string; // id for the feature itself -> react

  title: string;

  // letters
  senderId?: string;
  recipientId?: string;

  // dates
  date_start: string; // "YYYY-MM-DD"
  date_end?: string;
  date_sort?: string;

  has_coordinates?: boolean;

  // context
  full_text?: string;
  status?: string;
  url?: string;

  // classification
  topics?: string[];
  speech_acts?: string[];

  // *
  // relations/ forein keys
  //*

  // correspondence
  mentions?: string[];

  // points
  placeId?: string;
  name: string;
  description?: string;

  // // lines/transitions
  // sourcePlaceId?: string;
  // destinationPlaceId?: string;

  // // references (persons, works, places, etc.)
  // mentionedEntityIds?: string[];
}

// *
// Wrappers
//*

// a generic TypeScript feature that MUST have a geometry and MUST match the properties above
export interface HistoricalFeature
  extends Feature<Geometry | null, HistoricalFeatureProperties> {
  properties: HistoricalFeatureProperties;
}
export interface HistoricalFeatureCollection {
  type: "FeatureCollection";
  features: HistoricalFeature[];
}
