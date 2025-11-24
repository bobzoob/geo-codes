// this file will contain all the logic for updating applications states
// reducer is a pure function that takes the current state and an "action" and returns the next state.
import type { LayerConfig, SearchState, TimeRange, View } from "../types/state";
import type { HistoricalFeatureCollection } from "../types/geojson";

// shape of the applications state
export interface AppState {
  currentView: View;
  geoJsonData: Record<string, HistoricalFeatureCollection> | null;
  layerConfig: LayerConfig[];
  committedTimeRange: TimeRange;
  liveTimeRange: TimeRange;
  selectedLayerId: string | null;
  // collapse flags
  isLayerPanelCollapsed: boolean;
  isOptionsPanelCollapsed: boolean;
  activeMobilePanel: "layers" | "options" | "none";
}

// all possible actions, that can change the state
//this is a "discriminated union", ts function: represent multiple possible variants, distinguished by a common property called a discriminator
export type AppAction =
  | { type: "TOGGLE_LAYER_PANEL" }
  | { type: "TOGGLE_OPTIONS_PANEL" }
  | { type: "SET_ACTIVE_MOBILE_PANEL"; payload: "layers" | "options" | "none" }
  | { type: "SET_VIEW"; payload: View }
  | { type: "SELECT_LAYER"; payload: string | null }
  | { type: "CLEAR_ALL_FILTERS" }
  | {
      type: "SET_GEOJSON_DATA";
      payload: Record<string, HistoricalFeatureCollection>;
    }
  | {
      type: "SET_LAYER_VISIBILITY";
      payload: { layerId: string; isVisible: boolean };
    }
  | {
      type: "SET_LAYER_TOOLTIPS";
      payload: { layerId: string; showAll: boolean };
    }
  | {
      type: "UPDATE_LAYER_SEARCH";
      payload: { layerId: string; searchState: SearchState };
    }
  | { type: "SET_COMMITTED_TIME_RANGE"; payload: TimeRange }
  | { type: "SET_LIVE_TIME_RANGE"; payload: TimeRange };

//  handle all state updates
export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SELECT_LAYER":
      return {
        ...state,
        selectedLayerId: action.payload,
        isOptionsPanelCollapsed: false,
      };

    case "TOGGLE_LAYER_PANEL":
      return { ...state, isLayerPanelCollapsed: !state.isLayerPanelCollapsed };

    case "TOGGLE_OPTIONS_PANEL":
      return {
        ...state,
        isOptionsPanelCollapsed: !state.isOptionsPanelCollapsed,
      };

    case "SET_ACTIVE_MOBILE_PANEL":
      return { ...state, activeMobilePanel: action.payload };

    case "CLEAR_ALL_FILTERS":
      return {
        ...state,
        // map over every layer and reset search state
        layerConfig: state.layerConfig.map((layer) => {
          if (!layer.search) return layer; // if layer has no search, do nothing
          return {
            ...layer,
            search: {
              // to reset to the initial empty state
              plainText: "",
              sender: "",
              recipient: "",
              searchStartDate: "",
              searchEndDate: "",
              location: "",
            },
          };
        }),
      };
    case "SET_VIEW":
      return { ...state, currentView: action.payload };

    case "SET_GEOJSON_DATA":
      return { ...state, geoJsonData: action.payload };

    case "SET_LAYER_VISIBILITY":
      return {
        ...state,
        layerConfig: state.layerConfig.map((layer) =>
          layer.id === action.payload.layerId
            ? { ...layer, visible: action.payload.isVisible }
            : layer
        ),
      };

    case "SET_LAYER_TOOLTIPS":
      return {
        ...state,
        layerConfig: state.layerConfig.map((layer) =>
          layer.id === action.payload.layerId
            ? { ...layer, showAllTooltips: action.payload.showAll }
            : layer
        ),
      };

    case "UPDATE_LAYER_SEARCH":
      return {
        ...state,
        layerConfig: state.layerConfig.map((layer) =>
          layer.id === action.payload.layerId
            ? { ...layer, search: action.payload.searchState }
            : layer
        ),
      };

    case "SET_COMMITTED_TIME_RANGE":
      // here: when user finishes sliding: both time ranges are synced
      return {
        ...state,
        committedTimeRange: action.payload,
        liveTimeRange: action.payload,
      };

    case "SET_LIVE_TIME_RANGE":
      // here: during sliding, only the live range is updated -> important!
      return { ...state, liveTimeRange: action.payload };

    default:
      return state;
  }
};
