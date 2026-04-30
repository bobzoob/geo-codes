import type { LayerConfig } from "../types/state";

/**
 * INTITIAL LAYER REGISTRY
 * here you can define how to view your sources
 */

export const initialLayerConfig: LayerConfig[] = [
  {
    id: "letters-lines",
    sourceId: "correspondence-data", // pointer to GeoJSON + Mapping in sources.ts
    templateId: "letter-detail", // pointer to popup structure in templates.ts
    name: "Briefe der Frühromantik I", // displayed title
    subtitle: "nicht lokal versendet", // displayed subtitle
    tag: "GeoJSON", // displayed information tag
    description: "Frühromantische Briefe im Umkreis von Friedrich Schlegel", // displayed description
    visible: true, // layer toggled "on" from start
    type: "line", // layer type

    // DATA SPLITTER
    // here we define: only render features where "is_local" is NOT true aka flase
    baseFilter: { field: "is_local", operator: "neq", value: true },

    activeFilters: [
      { moduleId: "dateRange", placement: "search-area" },
      { moduleId: "plainText", placement: "search-area" },
      {
        moduleId: "entitySearch",
        placement: "search-area",
        section: "advanced",
      },
      {
        moduleId: "sender",
        placement: "search-area",
        section: "advanced",
        params: {
          useSuggestions: true, // enable fold-out
          suggestionType: "Person", // suggestions
          activeLabel: "Sender",
        },
      },
      {
        moduleId: "recipient",
        placement: "search-area",
        section: "advanced",
        params: {
          useSuggestions: true,
          suggestionType: "Person",
          activeLabel: "Recipient",
        },
      },
      {
        moduleId: "placeFilter",
        placement: "search-area",
        section: "advanced",
        params: {
          useSuggestions: true,
          suggestionType: "Place",
          activeLabel: "Location",
        },
      },
      {
        moduleId: "dataStatus",
        placement: "search-area",
        section: "toggles",
        params: {
          availableToggles: [
            { id: "gndOnly", label: "GND Verified Only" },
            { id: "manualOnly", label: "Manual Verified Only" },
            { id: "excludeInternal", label: "Hide Uncertain" },
          ],
        },
      },
    ],

    styleConfig: {
      // color of lines
      color: "#3388ff",
      opacity: 0.6,
    },

    // style the table
    tableConfig: {
      primaryField: "date_start",
      secondaryField: "sender_ids",
      resolveSecondary: true, // turn GND IDs into names
    },
  },

  {
    id: "local-letter-hubs",
    sourceId: "correspondence-data", // same source as lines
    templateId: "city-detail", // different popup template
    name: "Briefe der Frühromantik II", // displayed title
    subtitle: "lokal versendet", // displayed subtitle
    tag: "GeoJSON", // displayed information tag
    description: "Frühromantische Briefe im Umkreis von Friedrich Schlegel", // displayed description
    visible: true,
    type: "point",

    // DATA SPLITTER
    // here we only render features where "is_local" IS true.
    baseFilter: { field: "is_local", operator: "eq", value: true },

    // DATA PROCESSING
    // we group local letters by their origin city
    processor: {
      type: "aggregateByProperty",
      params: { groupBy: "origin_id" },
    },

    intensityField: "count", // scale circles

    activeFilters: [
      { moduleId: "dateRange", placement: "search-area" },
      { moduleId: "plainText", placement: "search-area" },
      {
        moduleId: "entitySearch",
        placement: "search-area",
        section: "advanced",
      },
      {
        moduleId: "sender",
        placement: "search-area",
        section: "advanced",
        params: {
          useSuggestions: true, // enable fold-out
          suggestionType: "Person", // suggestions
          activeLabel: "Sender",
        },
      },
      {
        moduleId: "recipient",
        placement: "search-area",
        section: "advanced",
        params: {
          useSuggestions: true,
          suggestionType: "Person",
          activeLabel: "Recipient",
        },
      },
      {
        moduleId: "placeFilter",
        placement: "search-area",
        section: "advanced",
        params: {
          useSuggestions: true,
          suggestionType: "Place",
          activeLabel: "Location",
        },
      },
      {
        moduleId: "dataStatus",
        placement: "search-area",
        section: "toggles",
        params: {
          availableToggles: [
            { id: "gndOnly", label: "GND Verified Only" },
            { id: "manualOnly", label: "Manual Verified Only" },
            { id: "excludeInternal", label: "Hide Uncertain" },
          ],
        },
      },
    ],

    styleConfig: {
      color: ["#BBDEFB", "#5C6BC0", "#6A1B9A"], // gradient based on count
      radius: [4, 35],
      opacity: 0.8,
    },
    // TABLE CONFIG
    tableConfig: {
      primaryField: "title",
      secondaryField: "count",
      templateId: "city-detail", // Use City template for Hub row
    },
    // this is to style the drill down list
    childTableConfig: {
      primaryField: "date_start",
      secondaryField: "sender_ids",
      resolveSecondary: true, // Because sender_ids are GND strings
      templateId: "letter-detail", // use letter-detail like the popup
    },
  },

  {
    id: "places-people",
    sourceId: "places-people-data",
    templateId: "place-biography",
    name: "Places & People",
    visible: false,
    type: "point",
    ignoreTimeFilter: true, // layer is static
    intensityField: "weight",

    activeFilters: [{ moduleId: "plainText", placement: "search-area" }],

    styleConfig: {
      color: ["#FFEB3B", "#FB8C00", "#D32F2F"],
      radius: [4, 35],
      opacity: 0.8,
    },
    tableConfig: {
      primaryField: "title",
      secondaryField: "activity_log", // This might need a custom formatter!!!
    },
  },

  {
    id: "historic-polygons",
    sourceId: "territories-data",
    templateId: "generic-info",
    name: "Historic Areas",
    visible: false, // layer toggled "off" from start
    ignoreTimeFilter: true,
    type: "polygon",

    activeFilters: [
      { moduleId: "dateRange", placement: "search-area" },
      { moduleId: "plainText", placement: "search-area" },
    ],

    styleConfig: {
      color: "#2e7d32",
      strokeColor: "#1b5e20",
      opacity: 0.4,
    },
    tableConfig: {
      primaryField: "title",
    },
  },
];
