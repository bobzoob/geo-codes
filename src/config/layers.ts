import type { LayerConfig } from "../types/state";
import SearchFormText from "../components/SearchFormText";
import SearchFormMultiField from "../components/SearchFormMultiField";
import SearchFormDate from "../components/SearchFormDate";
import SearchFormPlace from "../components/SearchFormPlace";

export const initialLayerConfig: LayerConfig[] = [
  {
    id: "territories-1",
    name: "LAYER I (polygons)",
    visible: true,
    type: "polygon",
    source: "/territories-data.geojson",
    showAllTooltips: false,
    filters: [
      { component: SearchFormText, placement: "search-area" },
      { component: SearchFormDate, placement: "timeline-area" },
    ],
  },
  {
    id: "event-1",
    name: "LAYER II (points)",
    visible: true,
    type: "point",
    source: "/events-data.geojson",
    showAllTooltips: false,
    search: {
      plainText: "",
      sender: "",
      recipient: "",
      location: "",
      searchStartDate: "",
      searchEndDate: "",
    },

    filters: [
      { component: SearchFormText, placement: "search-area" },
      { component: SearchFormPlace, placement: "search-area" },
      { component: SearchFormDate, placement: "timeline-area" },
    ],
  },
  {
    id: "letters-1",
    name: "LAYER III (transitions)",
    visible: true,
    type: "line",
    source: "/letters-data.geojson",
    showAllTooltips: false,
    search: {
      plainText: "",
      sender: "",
      recipient: "",
      location: "",
      searchStartDate: "",
      searchEndDate: "",
    },
    filters: [
      { component: SearchFormDate, placement: "timeline-area" },
      { component: SearchFormMultiField, placement: "search-area" },
      { component: SearchFormPlace, placement: "search-area" },
    ],
  },
];
