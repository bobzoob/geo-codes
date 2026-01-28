import type { LayerConfig } from "../types/state";

/**
 * REGISTER NEW LAYERS HERE
 */

export const initialLayerConfig: LayerConfig[] = [
  {
    id: "letters-master",
    name: "Hidden Master",
    visible: false,
    showInPanel: false,
    type: "line",
    // isLinkable: false // uncomment if layer should not resolve entities to links
    source: "/letters_lean.geojson",

    dictionaryId: "main_entities", // this is only nessesary if more than one dictionary exists

    // here we choose the filter options
    // and decide where they should appear
    // the logic is handled in filterUtils.ts
    activeFilters: [
      { moduleId: "dateRange", placement: "timeline-area" },
      { moduleId: "plainText", placement: "search-area" },
    ],

    // here we set up the appearance of the Popup
    // the locig is handled in popupUtils.ts
    popupConfig: [
      { field: "composite_letter_header", type: "header" },
      { field: "date_start", label: "Date", type: "text" },
      { field: "date_reliability", label: "Reliability", type: "tags" },
      {
        field: "sender_ids",
        label: "Sender",
        type: "list",
        resolveEntities: true, // this looks in "main_entities" dictionary
      },
      {
        field: "recipient_ids",
        label: "Recipient",
        type: "list",
        resolveEntities: true,
      },
      {
        field: "origin_id",
        label: "Sent from",
        type: "text",
        resolveEntities: true,
      },
      {
        field: "target_id",
        label: "Sent to",
        type: "text",
        resolveEntities: true,
      },
      {
        field: "mention_ids",
        label: "Mentions",
        type: "tags",
        resolveEntities: true,
        entityTypeFilter: "Person",
      },
      {
        field: "mention_ids",
        label: "Mentioned Works",
        type: "tags",
        resolveEntities: true,
        entityTypeFilter: "Work",
      },
      {
        field: "mention_ids",
        label: "Mentioned Places",
        type: "tags",
        resolveEntities: true,
        entityTypeFilter: "Place",
      },
      { field: "text_preview", type: "long-text" },
    ],
  },
  {
    id: "letters-1",
    name: "Letters",
    visible: true,
    type: "line",
    source: "/letters_lean.geojson",

    filterValues: {},

    activeFilters: [
      { moduleId: "dateRange", placement: "timeline-area" },
      { moduleId: "plainText", placement: "search-area" },

      { moduleId: "excludeLocal", placement: "search-area" }, // nessesary!
      {
        moduleId: "entitySearch",
        placement: "search-area",
        section: "advanced",
      },
      { moduleId: "sender", placement: "search-area", section: "advanced" },
      { moduleId: "recipient", placement: "search-area", section: "advanced" },
      {
        moduleId: "placeFilter",
        placement: "search-area",
        section: "advanced",
      },
    ],

    popupConfig: [
      { field: "composite_letter_header", type: "header" },
      { field: "date_start", label: "Date", type: "text" },
      { field: "date_reliability", label: "Reliability", type: "tags" },
      {
        field: "sender_ids",
        label: "Sender",
        type: "list",
        resolveEntities: true,
      },
      {
        field: "recipient_ids",
        label: "Recipient",
        type: "list",
        resolveEntities: true,
      },
      {
        field: "origin_id",
        label: "Sent from",
        type: "text",
        resolveEntities: true,
      },
      {
        field: "target_id",
        label: "Sent to",
        type: "text",
        resolveEntities: true,
      },
      {
        field: "mention_ids",
        label: "Mentions",
        type: "tags",
        resolveEntities: true,
        entityTypeFilter: "Person",
      },
      {
        field: "mention_ids",
        label: "Mentioned Works",
        type: "tags",
        resolveEntities: true,
        entityTypeFilter: "Work",
      },
      {
        field: "mention_ids",
        label: "Mentioned Places",
        type: "tags",
        resolveEntities: true,
        entityTypeFilter: "Place",
      },
      { field: "text_preview", type: "long-text" },
    ],
  },

  {
    id: "local-letters",
    name: "Local Letters",
    visible: true,
    type: "point",
    source: "/letters_lean.geojson",
    intensityField: "count", // for the radius of the circle
    showAllTooltips: false,
    hasFlashlight: true,

    styleConfig: {
      color: ["#BBDEFB", "#5C6BC0", "#6A1B9A"], // we deffine the point colors here
      radius: [4, 35], // Min 4px, Max 30px
      opacity: 0.8,
    },
    processor: {
      // we need the processor here
      type: "aggregateByProperty",
      params: { groupBy: "origin_id" },
    },
    activeFilters: [
      { moduleId: "localOnly", placement: "search-area" },
      { moduleId: "dateRange", placement: "timeline-area" },
      { moduleId: "plainText", placement: "search-area" },
      {
        moduleId: "entitySearch",
        placement: "search-area",
        section: "advanced",
      },
      { moduleId: "sender", placement: "search-area", section: "advanced" },
      { moduleId: "recipient", placement: "search-area", section: "advanced" },
      {
        moduleId: "placeFilter",
        placement: "search-area",
        section: "advanced",
      },
    ],
    popupConfig: [
      { field: "title", type: "header" },
      { field: "count", label: "Letters in this city", type: "text" },
      {
        field: "children",
        label: "Letters in this city",
        type: "feature-list",
        listLabelField: "date_start", // date in the list
        detailLayerId: "letters-master", // we use the Letter popup style
      },
    ],
  },

  {
    id: "places-people",
    name: "Places & People",
    visible: true,
    type: "point",
    source: "/places-people.geojson",
    showAllTooltips: false,
    hasFlashlight: true,
    ignoreTimeFilter: true,
    intensityField: "weight",

    styleConfig: {
      color: ["#FFEB3B", "#FB8C00", "#D32F2F"],
      radius: [4, 35],
      opacity: 0.8,
    },

    filterValues: {},
    activeFilters: [{ moduleId: "plainText", placement: "search-area" }],
    popupConfig: [
      { field: "title", type: "header" },
      { field: "born", label: "Born", type: "list", resolveEntities: true },
      { field: "died", label: "Died", type: "list", resolveEntities: true },

      {
        field: "activity_log",
        label: "Active People",
        type: "timed-list",
        resolveEntities: true,
      },
    ],
  },
  {
    id: "events",
    name: "Historic Events",
    visible: false,
    type: "point",
    source: "/wikidata_central_europe_events.json",
    showAllTooltips: false,
    hasFlashlight: true,
    filterValues: {
      // topic: "Literaturbetrieb", // this would set a default value
    },
    activeFilters: [
      { moduleId: "dateRange", placement: "timeline-area" },
      { moduleId: "topic", placement: "search-area" },
    ],
    popupConfig: [{ field: "title", type: "header" }],
  },
  {
    id: "polygons",
    name: "Historic Areas",
    visible: false,
    type: "polygon",
    styleConfig: { color: "#2e7d32", strokeColor: "#1b5e20" },
    source: "/territories-data.geojson",
    showAllTooltips: false,
    hasFlashlight: true,
    filterValues: {},
    activeFilters: [
      { moduleId: "dateRange", placement: "timeline-area" },
      { moduleId: "plainText", placement: "search-area" },
    ],
    popupConfig: [{ field: "title", type: "header" }],
  },
];
