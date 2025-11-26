import { Feature, GeoJsonProperties, Geometry } from "geojson";

// ---------------------------------------------------------------------------
// GeoJSON Feature Properties
// ---------------------------------------------------------------------------

// Here we define the structure that *this* specific GeoJSON data will have
// to enrich the dataformat we set up a new type here
// every file MUST have these properties
export type EntityType = "Person" | "Place" | "Work" | "Event" | "Organization";

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  description?: string;
  authorityId?: string; // this could also be a  wikidataId, GNDid, URL ...

  // keep coordinates both in entitiey-data and GEOjson data
  lat?: number;
  lng?: number;
}

//  map id's to entities
export type EntityMap = Record<string, Entity>;

export interface HistoricalFeatureProperties extends GeoJsonProperties {
  id: string; // id for the feature itself
  name: string;
  description?: string;
  startDate: string; //"YYYY-MM-DD"
  endDate: string;

  // ---------------------------------------------------------------------------
  // Foreign Keys
  // ---------------------------------------------------------------------------

  // correspondence
  senderId?: string;
  recipientId?: string;

  // points
  placeId?: string;

  // lines/transitions
  sourcePlaceId?: string;
  destinationPlaceId?: string;

  // references (persons, works, places, etc.)
  mentionedEntityIds?: string[];
}

// ---------------------------------------------------------------------------
// Wrappers
// ---------------------------------------------------------------------------

// a generic TypeScript feature that MUST have a geometry and MUST match the properties above
export interface HistoricalFeature
  extends Feature<Geometry, HistoricalFeatureProperties> {
  properties: HistoricalFeatureProperties;
}
export interface HistoricalFeatureCollection {
  type: "FeatureCollection";
  features: HistoricalFeature[];
}
