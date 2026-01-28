/**
 * THIS IS HERE WE DEFINE DICTIONARY SOURCES
 * AND SET UP BOUNDARIES FOR
 * TIMELINE AND MAP
 */

export const APP_CONFIG = {
  // SET DICTIONARY
  dictionaries: [
    { id: "main_entities", source: "/final_manifest.json" },
    //{ id: "your_entities", source: "/your_dictionary.json" } // add more if needed
  ],
  // SET TIMELINE BOUNDARIES
  timeRange: {
    min: 1790,
    max: 1802,
  },
  // SET MAP DEFAULT
  map: {
    defaultCenter: [50.92878, 11.5899],
    defaultZoom: 5,
  },
};
