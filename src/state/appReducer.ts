import type {
  AppState,
  FilterValue,
  TimeRange,
  View,
  SelectionState,
} from "../types/state";
import type { HistoricalFeatureCollection, EntityMap } from "../types/geojson";

/**
 * this file will contain all the logic for updating applications states
 * reducer is a pure function that takes the current state and an "action"
 * and returns the next state.
 */

// HELPER to group max 3 panel into
// configuration-group and data-group
const enforceGroupMode = (
  state: AppState,
  newlyOpenedPanel: "layer" | "options" | "table" | "detail"
): AppState => {
  if (newlyOpenedPanel === "layer" || newlyOpenedPanel === "options") {
    // Switching to CONFIG MODE: Close Data Mode panels
    return {
      ...state,
      isTablePanelCollapsed: true,
      isDetailPanelCollapsed: true,
    };
  }

  if (newlyOpenedPanel === "table" || newlyOpenedPanel === "detail") {
    // Switching to DATA MODE: Close Config Mode panels
    return {
      ...state,
      isLayerPanelCollapsed: true,
      isOptionsPanelCollapsed: true,
    };
  }

  return state;
};

// all possible actions, that can change the state.
//this is a "discriminated union", ts function:
// represent multiple possible variants,
// distinguished by a common property called a discriminator
export type AppAction =
  | { type: "TOGGLE_LAYER_PANEL" }
  | { type: "TOGGLE_OPTIONS_PANEL" }
  | { type: "TOGGLE_ACTIVE_FILTERS_PANEL" }
  | { type: "TOGGLE_TABLE_PANEL" }
  | { type: "TOGGLE_DETAIL_PANEL" }
  | { type: "SET_TABLE_PAGE"; payload: number }
  | { type: "SET_TABLE_LOADED"; payload: boolean }
  | {
      type: "SET_ACTIVE_MOBILE_PANEL";
      payload: "layers" | "options" | "filters" | "table" | "none";
    }
  | { type: "SET_VIEW"; payload: View }
  | { type: "SELECT_LAYER"; payload: string | null }
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
  | { type: "CLEAR_ALL_FILTERS" }
  | { type: "CLEAR_LAYER_FILTERS"; payload: string }
  | { type: "REMOVE_FILTER"; payload: { layerId?: string; moduleId: string } }

  // time control
  | { type: "SET_COMMITTED_TIME_RANGE"; payload: TimeRange }
  | { type: "SET_LIVE_TIME_RANGE"; payload: TimeRange }

  // dictionaries
  | { type: "SET_DICTIONARIES"; payload: Record<string, EntityMap> }

  // sources
  | {
      type: "SET_RAW_SOURCES";
      payload: Record<string, HistoricalFeatureCollection>;
    }
  // color highlighting
  | { type: "SELECT_FEATURE"; payload: SelectionState | null }

  // drill down list
  | { type: "SET_DRILL_DOWN"; payload: any | null };

//  handle all state updates
export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "TOGGLE_LAYER_PANEL": {
      const willOpen = state.isLayerPanelCollapsed;
      let newState = {
        ...state,
        isLayerPanelCollapsed: !state.isLayerPanelCollapsed,
      };
      return willOpen ? enforceGroupMode(newState, "layer") : newState;
    }

    case "TOGGLE_OPTIONS_PANEL": {
      const willOpen = state.isOptionsPanelCollapsed;
      let newState = {
        ...state,
        isOptionsPanelCollapsed: !state.isOptionsPanelCollapsed,
      };
      return willOpen ? enforceGroupMode(newState, "options") : newState;
    }

    case "TOGGLE_TABLE_PANEL": {
      const willOpen = state.isTablePanelCollapsed;
      let newState = {
        ...state,
        isTablePanelCollapsed: !state.isTablePanelCollapsed,
      };
      return willOpen ? enforceGroupMode(newState, "table") : newState;
    }

    case "TOGGLE_DETAIL_PANEL": {
      const willOpen = state.isDetailPanelCollapsed;
      let newState = {
        ...state,
        isDetailPanelCollapsed: !state.isDetailPanelCollapsed,
      };
      return willOpen ? enforceGroupMode(newState, "detail") : newState;
    }

    case "TOGGLE_ACTIVE_FILTERS_PANEL": {
      // The Filter panel is the "Bridge". It belongs to both groups,
      // so opening it does NOT trigger a mode switch or close anything else.
      return {
        ...state,
        isActiveFiltersPanelCollapsed: !state.isActiveFiltersPanelCollapsed,
      };
    }

    case "SET_TABLE_LOADED":
      return { ...state, isTableLoaded: action.payload, tablePage: 0 };
    case "SET_TABLE_PAGE":
      return { ...state, tablePage: action.payload };

    case "SET_ACTIVE_MOBILE_PANEL":
      return { ...state, activeMobilePanel: action.payload };
    case "SET_VIEW":
      return { ...state, currentView: action.payload };

    // loading progress
    case "SET_LOADING_PROGRESS":
      return { ...state, loadingProgress: action.payload };

    // Layer
    // case "SELECT_LAYER":
    //   return {
    //     ...state,
    //     selectedLayerId: action.payload,
    //     isOptionsPanelCollapsed: false,
    //     isTableLoaded: false,
    //     tablePage: 0,
    //   };

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
          state.settings.timeRange.min,
          state.settings.timeRange.max,
        ],
        liveTimeRange: [
          state.settings.timeRange.min,
          state.settings.timeRange.max,
        ],
        // reset filter
        layerConfig: state.layerConfig.map((layer) => ({
          ...layer,
          // empty -> automatically defaultValue from the registry
          filterValues: {},
        })),
      };
    case "CLEAR_LAYER_FILTERS":
      return {
        ...state,
        // only reset the one matching the payload ID
        layerConfig: state.layerConfig.map((layer) =>
          layer.id === action.payload ? { ...layer, filterValues: {} } : layer
        ),
      };
    case "REMOVE_FILTER": {
      const { layerId, moduleId } = action.payload;

      // CASE Global Time Reset
      if (moduleId === "global-time") {
        return {
          ...state,
          committedTimeRange: [
            state.settings.timeRange.min,
            state.settings.timeRange.max,
          ],
          liveTimeRange: [
            state.settings.timeRange.min,
            state.settings.timeRange.max,
          ],
        };
      }

      // CASE Specific Layer Filter Reset
      return {
        ...state,
        layerConfig: state.layerConfig.map((layer) => {
          if (layer.id !== layerId) return layer;

          // remove the key from filterValues so it reverts to defaultValue
          const newFilterValues = { ...layer.filterValues };
          delete newFilterValues[moduleId];

          return { ...layer, filterValues: newFilterValues };
        }),
      };
    }

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

    // sources
    case "SET_RAW_SOURCES":
      return { ...state, rawSources: action.payload };

    // color highlighting
    case "SELECT_FEATURE": {
      const willOpenDetail = action.payload !== null;
      let newState = {
        ...state,
        selectedFeature: action.payload,
        isDetailPanelCollapsed: !willOpenDetail, // Open if feature selected
        activeMobilePanel: action.payload
          ? "detail"
          : ((state.activeMobilePanel === "detail"
              ? "none"
              : state.activeMobilePanel) as AppState["activeMobilePanel"]),
      };
      return willOpenDetail ? enforceGroupMode(newState, "detail") : newState;
    }

    // drill down lost
    case "SET_DRILL_DOWN":
      return {
        ...state,
        drilledDownFeature: action.payload,
        tablePage: 0, // Reset pagination when entering/leaving
      };

    // Ensure we exit drill-down if the layer changes
    case "SELECT_LAYER": {
      const willOpenOptions = action.payload !== null;
      let newState = {
        ...state,
        selectedLayerId: action.payload,
        isOptionsPanelCollapsed: !willOpenOptions, // Open options when layer selected
        isTableLoaded: false,
        drilledDownFeature: null,
      };
      return willOpenOptions ? enforceGroupMode(newState, "options") : newState;
    }
    default:
      return state;
  }
};
