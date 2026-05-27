import type { LayerConfig } from "../types/state";

/**
 * INTITIAL LAYER REGISTRY
 * here you can define how to view your sources
 */

export const initialLayerConfig: LayerConfig[] = [
  {
    id: "letters-lines",
    group: "briefe", // sorts layer to a certain group
    sourceId: "correspondence-data", // pointer to GeoJSON + Mapping in sources.ts
    templateId: "letter-detail", // pointer to popup structure in templates.ts
    name: "Briefe der Frühromantik I", // displayed title
    subtitle: "nicht lokal versendet", // displayed subtitle
    tag: "GeoJSON", // displayed information tag
    description: "Frühromantische Briefe im Umfeld Friedrich Schlegels", // displayed description
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

    // // here you can group features based on values
    // interactionConfig: {
    //   groupingField: "sender_ids", // based on the value of this field
    // },
  },

  {
    id: "local-letter-hubs",
    group: "briefe",
    sourceId: "correspondence-data", // same source as lines
    templateId: "city-detail", // different popup template
    name: "Briefe der Frühromantik II", // displayed title
    subtitle: "lokal versendet oder Ort unbekannt", // displayed subtitle
    tag: "GeoJSON", // displayed information tag
    description: "Frühromantische Briefe im Umfeld Friedrich Schlegels", // displayed description
    visible: true,
    type: "point",

    // DATA SPLITTER
    // here we only render features where "is_local" IS true.
    baseFilter: {
      logic: "AND",
      conditions: [
        { field: "has_coordinates", operator: "eq", value: true }, // Excludes features where BOTH are null
        {
          logic: "OR",
          conditions: [
            { field: "is_local", operator: "eq", value: true },
            { field: "origin_id", operator: "isNull" },
            { field: "target_id", operator: "isNull" },
          ],
        },
      ],
    },

    // DATA PROCESSING
    // we group local letters by their origin city
    processor: {
      type: "aggregateByProperty",
      params: { groupBy: "origin_id" },
    },

    intensityField: "count", // scale circles

    // which panel should interact with the click
    // on the detail
    interactionConfig: {
      clickTrigger: "table", // tells the hook: on click, open DataTable
    },

    // filter
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
    name: "Biographie der Orte",
    tag: "GeoJSON", // displayed information tag
    description: "Die Orte in den Biefen der Frühromantik", // displayed description
    visible: false, // toggled of by start
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
      secondaryField: "activity_log",
      secondaryFormat: "count", // we can tell the engine to count the array
      secondarySuffix: "recorded activities", // appendix to count
    },
  },

  {
    id: "historic-polygons",
    sourceId: "territories-data",
    templateId: "polygon-detail",
    name: "Preußen",
    tag: " MultiPolygon GeoJSON", // displayed information tag
    description: "In den Grenzen von 1834 bis 1850", // displayed description
    visible: true,
    ignoreTimeFilter: true,
    type: "polygon",

    activeFilters: [{ moduleId: "plainText", placement: "search-area" }],

    styleConfig: {
      color: "#2e7d32",
      strokeColor: "#1b5e20",
      opacity: 0.4,
    },
    tableConfig: {
      primaryField: "title",
    },
  },
  {
    id: "grouping-layer",
    sourceId: "correspondence-data", // pointer to GeoJSON + Mapping in sources.ts
    templateId: "letter-detail", // pointer to popup structure in templates.ts
    name: "Gruppierte Briefe", // displayed title
    subtitle: "Sender/Empfänger gleich", // displayed subtitle
    tag: "GeoJSON", // displayed information tag
    description: "Diese Ebene gruppiert die Briefdaten nach Kontaktpartnern.", // displayed description
    visible: false, // layer toggled "on" from start
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
      color: "#90ee90",
      opacity: 0.6,
    },

    // style the table
    tableConfig: {
      primaryField: "date_start",
      secondaryField: "sender_ids",
      resolveSecondary: true, // turn GND IDs into names
    },

    // GROUP features based on values
    interactionConfig: {
      clickTrigger: "table",
      //   groupingField: "sender_ids", // SIMPLE: uncomment this, if you want to group based on a singel condition

      // COMPLEX
      // we can use the baseFilter logic to group features.
      // In this example we group all letters sharing the same sender
      // AND the same recipient
      groupingFilter: {
        logic: "AND",
        conditions: [
          {
            field: "sender_ids",
            operator: "in",
            matchReferenceField: "sender_ids",
          },
          {
            field: "recipient_ids",
            operator: "in",
            matchReferenceField: "recipient_ids",
          },
        ],
      },
    },
  },
];
