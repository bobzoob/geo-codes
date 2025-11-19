import type { LayerConfig } from "../types/state";
import SearchFormText from "../components/SearchFormText";
import SearchFormMultiField from "../components/SearchFormMultiField";
//import PointFilterContainer from "../components/PointFilterContainer";

export const initialLayerConfig: LayerConfig[] = [
  {
    id: "territories-1",
    name: "some historical territories",
    visible: true,
    type: "polygon",
    source: "/territories-data.geojson",
    showAllTooltips: false,
  },
  {
    id: "event-1",
    name: "important Event",
    visible: true,
    type: "point",
    source: "/events-data.geojson",
    showAllTooltips: false,
    search: {
      plainText: "",
      sender: "",
      recipient: "",
      searchStartDate: "",
      searchEndDate: "",
    },
    FilterComponents: [SearchFormText],
  },
  {
    id: "letters-1",
    name: "Kelsen letters",
    visible: true,
    type: "line",
    source: "/letters-data.geojson",
    showAllTooltips: false,
    search: {
      plainText: "",
      sender: "",
      recipient: "",
      searchStartDate: "",
      searchEndDate: "",
    },
    FilterComponents: [SearchFormMultiField],
  },
];
