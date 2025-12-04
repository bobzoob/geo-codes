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

    // Initial State
    filterValues: {},

    // Composition: Pick which blocks you want
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
  },
  {
    id: "topics-heatmap",
    name: "Topics Heatmap",
    visible: false,
    type: "heatmap",
    source: "/letters-data.geojson",
    showAllTooltips: false,
    filterValues: {
      // topic: "Literaturbetrieb", // set default ?
    },
    activeFilters: [
      { moduleId: "dateRange", placement: "timeline-area" },
      { moduleId: "topic", placement: "search-area" },
    ],
  },
];
