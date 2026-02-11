import type { SourceConfig } from "../types/config";

/**
 * DATA SOURCE REGISTRY
 * you define the keys for YOUR specific research data
 * and map them to a generic framwork architecture
 */

// DICTIONARY REGISTRY
export const dictionaries = [
  { id: "main_entities", url: "/final_manifest.json" },
  // "secondary_entities": "/other_dict.json" // uncomment if second exists
];

export const sources: Record<string, SourceConfig> = {
  "correspondence-data": {
    id: "correspondence-data",
    url: "/letters_lean.geojson",
    type: "geojson",
    dictionaryId: "main_entities",
    mapping: {
      id: "id", // unique feature ID
      title: "text_preview", // default title for tooltips
      dateStart: "date_start",
      dateEnd: "date_end",
      // fields the generic text search should look into
      textSearch: ["text_preview", "topic_list"],
      // fields containing IDs that need dictionary lookup
      entityRefs: [
        "sender_ids",
        "recipient_ids",
        "mention_ids",
        "origin_id",
        "target_id",
      ],
    },
  },

  "places-people-data": {
    id: "places-people-data",
    url: "/places-people.geojson",
    type: "geojson",
    dictionaryId: "main_entities",
    mapping: {
      id: "id",
      title: "title",
      dateStart: "active_from", // this needs refactoring!
      dateEnd: "active_to",
      textSearch: ["title", "biography"],
      entityRefs: ["born", "died", "activity_log"],
    },
  },

  "territories-data": {
    id: "territories-data",
    url: "/territories-data.geojson",
    type: "geojson",
    mapping: {
      id: "id",
      title: "title",
      dateStart: "start_year",
      dateEnd: "end_year",
      textSearch: ["title"],
      entityRefs: [],
    },
  },
};
