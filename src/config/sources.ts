import type { SourceConfig } from "../types/config";

/**
 * DATA SOURCE REGISTRY
 * you define the keys for YOUR specific research data
 * and map them to a generic framwork architecture
 */

// DICTIONARY REGISTRY
export const dictionaries = [
  { id: "main_entities", url: "/final_manifest_refined.json" },
  // "secondary_entities": "/other_dict.json" // uncomment if second exists
];

export const sources: Record<string, SourceConfig> = {
  "correspondence-data": {
    id: "correspondence-data",
    url: "/linkable_letters.geojson",
    type: "geojson",
    dictionaryId: "main_entities",
    mapping: {
      id: "id", // unique feature ID
      title: "full_text", // default title for tooltips
      dateStart: ["date_start", "date_sort"], // if not value is set for field 1, we look in field 2 and so on
      dateEnd: ["date_end", "date_sort"], // but we could also use one single sting
      children: "children",
      // fields the generic text search should look into
      textSearch: ["full_text", "topic_list"],
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
    url: "/places_biography.geojson",
    type: "geojson",
    dictionaryId: "main_entities",
    mapping: {
      id: "id",
      title: "title",
      dateStart: "active_from", // this needs refactoring!
      dateEnd: "active_to",
      textSearch: ["title", "biography"],
      entityRefs: ["born", "died", "activity_log", "gnd_activity"],
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
