import type { LayerConfig } from "../types/state";

/**
 * REGISTER NEW LAYERS HERE
 */

export const initialLayerConfig: LayerConfig[] = [
  {
    id: "letters-1",
    name: "Letters",
    visible: true,
    type: "line",
    source: "/letters-data.geojson",
    showAllTooltips: false,

    filterValues: {},

    // here we choose the filter options
    // and decide where they should appear
    // the logic is handled in filterUtils.ts
    activeFilters: [
      { moduleId: "dateRange", placement: "timeline-area" },
      { moduleId: "plainText", placement: "search-area" },
      {
        moduleId: "entitySearch",
        placement: "search-area",
        section: "advanced",
      },
      { moduleId: "sender", placement: "search-area", section: "advanced" },
      { moduleId: "recipient", placement: "search-area", section: "advanced" },
    ],

    // here we set up the appearance of the Popup
    // the locig is handled in popupUtils.ts
    popupConfig: [
      { field: "title", type: "header" },
      { field: "date_start", label: "Date", type: "text" },
      {
        field: "mentions",
        label: "Mentions",
        type: "tags",
        resolveEntities: true,
      },
      { field: "full_text", type: "long-text" },
    ],
  },
  {
    id: "events",
    name: "Historic Events",
    visible: true,
    type: "point",
    source: "/wikidata_central_europe_events.json",
    showAllTooltips: false,
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
    id: "places-people",
    name: "Places & People",
    visible: true,
    type: "point",
    source: "/places-people.geojson",
    showAllTooltips: false,
    ignoreTimeFilter: true,
    intensityField: "weight",
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
    id: "polygons",
    name: "Historic Areas",
    visible: true,
    type: "polygon",
    source: "/territories-data.geojson",
    showAllTooltips: false,
    filterValues: {},
    activeFilters: [
      { moduleId: "dateRange", placement: "timeline-area" },
      { moduleId: "plainText", placement: "search-area" },
    ],
    popupConfig: [{ field: "title", type: "header" }],
  },
];
