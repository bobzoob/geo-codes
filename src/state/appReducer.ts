import type { AppState, FilterValue, TimeRange, View } from "../types/state";
import type { HistoricalFeatureCollection, EntityMap } from "../types/geojson";
import { APP_CONFIG } from "../config/appConfig";

/**
 * this file will contain all the logic for updating applications states
 * reducer is a pure function that takes the current state and an "action"
 * and returns the next state.
 */

// all possible actions, that can change the state.
//this is a "discriminated union", ts function:
// represent multiple possible variants,
// distinguished by a common property called a discriminator
export type AppAction =
  | { type: "TOGGLE_LAYER_PANEL" }
  | { type: "TOGGLE_OPTIONS_PANEL" }
  | {
      type: "SET_ACTIVE_MOBILE_PANEL";
      payload: "layers" | "options" | "filters" | "none";
    }
  | { type: "SET_VIEW"; payload: View }
  | { type: "SELECT_LAYER"; payload: string | null }
  | { type: "CLEAR_ALL_FILTERS" }
  | { type: "TOGGLE_ACTIVE_FILTERS_PANEL" }

  // Data loading
  | {
      type: "SET_GEOJSON_DATA";
      payload: Record<string, HistoricalFeatureCollection>;
    }
  | { type: "SET_LOADING_PROGRESS"; payload: number }

  // Layer config
  | {
      type: "SET_LAYER_VISIBILITY";
      payload: { layerId: string; isVisible: boolean };
    }
  | {
      type: "SET_LAYER_TOOLTIPS";
      payload: { layerId: string; showAll: boolean };
    }
  // Generic filter
  | {
      type: "UPDATE_FILTER_VALUE";
      payload: { layerId: string; filterId: string; value: FilterValue };
    }

  // time control
  | { type: "SET_COMMITTED_TIME_RANGE"; payload: TimeRange }
  | { type: "SET_LIVE_TIME_RANGE"; payload: TimeRange }

  // dictionaries
  | { type: "SET_DICTIONARIES"; payload: Record<string, EntityMap> };

//  handle all state updates
export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "TOGGLE_LAYER_PANEL":
      return { ...state, isLayerPanelCollapsed: !state.isLayerPanelCollapsed };

    case "TOGGLE_OPTIONS_PANEL":
      return {
        ...state,
        isOptionsPanelCollapsed: !state.isOptionsPanelCollapsed,
      };

    case "SET_ACTIVE_MOBILE_PANEL":
      return { ...state, activeMobilePanel: action.payload };
    case "SET_VIEW":
      return { ...state, currentView: action.payload };

    case "SET_GEOJSON_DATA":
      return { ...state, geoJsonData: action.payload };

    // loading progress
    case "SET_LOADING_PROGRESS":
      return { ...state, loadingProgress: action.payload };

    // Layer
    case "SELECT_LAYER":
      return {
        ...state,
        selectedLayerId: action.payload,
        isOptionsPanelCollapsed: false,
      };

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
    // Filter

    case "UPDATE_FILTER_VALUE":
      return {
        ...state,
        layerConfig: state.layerConfig.map((layer) => {
          if (layer.id !== action.payload.layerId) return layer;

          return {
            ...layer,
            filterValues: {
              ...(layer.filterValues || {}),
              [action.payload.filterId]: action.payload.value,
            },
          };
        }),
      };

    case "CLEAR_ALL_FILTERS":
      return {
        ...state,
        // reset time to default
        committedTimeRange: [
          APP_CONFIG.timeRange.min,
          APP_CONFIG.timeRange.max,
        ],
        liveTimeRange: [APP_CONFIG.timeRange.min, APP_CONFIG.timeRange.max],
        // reset filter
        layerConfig: state.layerConfig.map((layer) => ({
          ...layer,
          // empty -> automatically defaultValue from the registry
          filterValues: {},
        })),
      };

    case "TOGGLE_ACTIVE_FILTERS_PANEL":
      return {
        ...state,
        isActiveFiltersPanelCollapsed: !state.isActiveFiltersPanelCollapsed,
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

    // dictionaries
    case "SET_DICTIONARIES":
      return { ...state, dictionaries: action.payload };

    default:
      return state;
  }
};
