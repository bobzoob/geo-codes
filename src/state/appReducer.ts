import type {
  AppState,
  FilterValue,
  TimeRange,
  View,
  SelectionState,
  HighlightState,
  StoryConfig,
} from "../types/state";
import type { HistoricalFeatureCollection, EntityMap } from "../types/geojson";
import { initialLayerConfig } from "../config/layers";

export type AppAction =
  | { type: "TOGGLE_LAYER_PANEL" }
  | { type: "TOGGLE_OPTIONS_PANEL" }
  | { type: "TOGGLE_ACTIVE_FILTERS_PANEL" }
  | { type: "TOGGLE_TABLE_PANEL" }
  | { type: "TOGGLE_DETAIL_PANEL" }
  | { type: "SET_TABLE_PAGE"; payload: { layerId: string; page: number } }
  | { type: "SET_TABLE_LOADED"; payload: boolean }
  | {
      type: "SET_ACTIVE_MOBILE_PANEL";
      payload: "layers" | "options" | "filters" | "table" | "detail" | "none";
    }
  | { type: "SET_VIEW"; payload: View }
  | { type: "SELECT_LAYER"; payload: string | null }
  | { type: "SET_LOADING_PROGRESS"; payload: number }
  | {
      type: "SET_LAYER_VISIBILITY";
      payload: { layerId: string; isVisible: boolean };
    }
  | {
      type: "SET_LAYER_TOOLTIPS";
      payload: { layerId: string; showAll: boolean };
    }
  | {
      type: "UPDATE_FILTER_VALUE";
      payload: { layerId: string; filterId: string; value: FilterValue };
    }
  | { type: "CLEAR_ALL_FILTERS" }
  | { type: "CLEAR_LAYER_FILTERS"; payload: string }
  | { type: "REMOVE_FILTER"; payload: { layerId?: string; moduleId: string } }
  | { type: "SET_COMMITTED_TIME_RANGE"; payload: TimeRange }
  | { type: "SET_LIVE_TIME_RANGE"; payload: TimeRange }
  | { type: "SET_DICTIONARIES"; payload: Record<string, EntityMap> }
  | {
      type: "SET_RAW_SOURCES";
      payload: Record<string, HistoricalFeatureCollection>;
    }
  | { type: "SELECT_FEATURE"; payload: SelectionState | null }
  | { type: "SET_HIGHLIGHTED_FEATURES"; payload: HighlightState[] }
  | {
      type: "SET_LAYER_DRILL_DOWN";
      payload: { layerId: string; parentFeature: any | null };
    }
  // story mode actions
  | { type: "START_STORY"; payload: StoryConfig }
  | { type: "SET_STORY_FRAME"; payload: number }
  | { type: "EXIT_STORY" };

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    // --- INDEPENDENT PANEL TOGGLES ---
    case "TOGGLE_LAYER_PANEL":
      return { ...state, isLayerPanelCollapsed: !state.isLayerPanelCollapsed };

    case "TOGGLE_OPTIONS_PANEL":
      return {
        ...state,
        isOptionsPanelCollapsed: !state.isOptionsPanelCollapsed,
      };

    case "TOGGLE_TABLE_PANEL":
      return { ...state, isTablePanelCollapsed: !state.isTablePanelCollapsed };

    case "TOGGLE_DETAIL_PANEL":
      return {
        ...state,
        isDetailPanelCollapsed: !state.isDetailPanelCollapsed,
      };

    case "TOGGLE_ACTIVE_FILTERS_PANEL":
      return {
        ...state,
        isActiveFiltersPanelCollapsed: !state.isActiveFiltersPanelCollapsed,
      };

    // --- DATA & PAGINATION ---
    case "SET_TABLE_LOADED":
      return { ...state, isTableLoaded: action.payload, tablePage: {} };

    case "SET_TABLE_PAGE":
      return {
        ...state,
        tablePage: {
          ...state.tablePage,
          [action.payload.layerId]: action.payload.page,
        },
      };

    case "SET_RAW_SOURCES":
      return {
        ...state,
        rawSources: action.payload,
        tablePage: {},
        layerSubState: {},
      };

    // --- NAVIGATION & VIEW ---
    case "SET_ACTIVE_MOBILE_PANEL":
      return { ...state, activeMobilePanel: action.payload };

    case "SET_VIEW":
      return { ...state, currentView: action.payload };

    case "SET_LOADING_PROGRESS":
      return { ...state, loadingProgress: action.payload };

    // --- LAYER CONFIGURATION ---
    case "SELECT_LAYER":
      return {
        ...state,
        selectedLayerId: action.payload,
        // Auto-open options when a layer is selected
        isOptionsPanelCollapsed: action.payload
          ? false
          : state.isOptionsPanelCollapsed,
      };

    case "SET_LAYER_VISIBILITY":
      return {
        ...state,
        layerConfig: state.layerConfig.map((l) =>
          l.id === action.payload.layerId
            ? { ...l, visible: action.payload.isVisible }
            : l
        ),
      };

    case "SET_LAYER_TOOLTIPS":
      return {
        ...state,
        layerConfig: state.layerConfig.map((l) =>
          l.id === action.payload.layerId
            ? { ...l, showAllTooltips: action.payload.showAll }
            : l
        ),
      };

    // --- GENERIC DRILL-DOWN (The "Data Blind" Engine) ---
    case "SET_LAYER_DRILL_DOWN": {
      const { layerId, parentFeature } = action.payload;

      // 1. If clearing the drill-down for this layer
      if (!parentFeature) {
        const newSubState = { ...state.layerSubState };
        delete newSubState[layerId];
        return {
          ...state,
          layerSubState: newSubState,
          highlightedFeatures: [],
        };
      }

      // 2. If drilling in: Resolve the children key from the source mapping
      const layer = state.layerConfig.find((l) => l.id === layerId);
      const source = state.sources[layer?.sourceId || ""];
      const childKey = source?.mapping?.children || "children";

      const rawChildren = parentFeature.properties[childKey];

      // Handle MapLibre stringification safety
      const childrenData =
        typeof rawChildren === "string" ? JSON.parse(rawChildren) : rawChildren;

      return {
        ...state,
        layerSubState: {
          ...state.layerSubState,
          [layerId]: {
            parentId: String(parentFeature.id || parentFeature.properties?.id),
            data: childrenData,
          },
        },
        // UI Feedback: Focus the layer and open the table
        selectedLayerId: layerId,
        isTablePanelCollapsed: false,
        tablePage: { ...state.tablePage, [layerId]: 0 },
      };
    }

    // --- FILTERING ---
    case "UPDATE_FILTER_VALUE":
      return {
        ...state,
        layerConfig: state.layerConfig.map((l) => {
          if (l.id !== action.payload.layerId) return l;
          return {
            ...l,
            filterValues: {
              ...(l.filterValues || {}),
              [action.payload.filterId]: action.payload.value,
            },
          };
        }),
      };

    case "REMOVE_FILTER": {
      const { layerId, moduleId } = action.payload;
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
      return {
        ...state,
        layerConfig: state.layerConfig.map((l) => {
          if (l.id !== layerId) return l;
          const newFilterValues = { ...l.filterValues };
          delete newFilterValues[moduleId];
          return { ...l, filterValues: newFilterValues };
        }),
      };
    }

    case "CLEAR_ALL_FILTERS":
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
        layerConfig: state.layerConfig.map((l) => ({ ...l, filterValues: {} })),
      };

    case "CLEAR_LAYER_FILTERS":
      return {
        ...state,
        layerConfig: state.layerConfig.map((l) =>
          l.id === action.payload ? { ...l, filterValues: {} } : l
        ),
      };

    // --- TEMPORAL CONTROL ---
    case "SET_COMMITTED_TIME_RANGE":
      return {
        ...state,
        committedTimeRange: action.payload,
        liveTimeRange: action.payload,
      };

    case "SET_LIVE_TIME_RANGE":
      return { ...state, liveTimeRange: action.payload };

    // --- DATA SOURCES & DICTIONARIES ---
    case "SET_DICTIONARIES":
      return { ...state, dictionaries: action.payload };

    // --- FEATURE SELECTION (Detail Panel) ---
    case "SELECT_FEATURE":
      return {
        ...state,
        selectedFeature: action.payload,
        // Auto-open detail panel if a feature is selected
        isDetailPanelCollapsed: action.payload ? false : true,
        activeMobilePanel: action.payload
          ? "detail"
          : state.activeMobilePanel === "detail"
          ? "none"
          : state.activeMobilePanel,
      };
    case "SET_HIGHLIGHTED_FEATURES":
      return { ...state, highlightedFeatures: action.payload };

    // STORY MODE
    case "START_STORY": {
      const manifest = action.payload;
      const firstFrame = manifest.frames[0];

      return {
        ...state,
        isStoryModeActive: true,
        storyManifest: manifest,
        currentStoryIndex: 0,

        // 1. Apply first frame's time
        committedTimeRange: firstFrame.timeRange,
        liveTimeRange: firstFrame.timeRange,

        // 2. Apply first frame's highlights
        highlightedFeatures: firstFrame.highlights.map((h) => ({
          id: h.featureId,
          layerId: h.layerId,
        })),

        // 3. Clear all filters and apply frame's layer visibility
        layerConfig: state.layerConfig.map((l) => ({
          ...l,
          filterValues: {},
          visible: firstFrame.visibleLayers.includes(l.id),
        })),

        // 4. Close all standard panels to focus on the story
        isLayerPanelCollapsed: true,
        isOptionsPanelCollapsed: true,
        isActiveFiltersPanelCollapsed: true,
        isTablePanelCollapsed: true,
        isDetailPanelCollapsed: true,
        selectedFeature: null,
        layerSubState: {},
      };
    }

    case "SET_STORY_FRAME": {
      if (!state.storyManifest) return state;
      const frame = state.storyManifest.frames[action.payload];

      return {
        ...state,
        currentStoryIndex: action.payload,
        committedTimeRange: frame.timeRange,
        liveTimeRange: frame.timeRange,
        highlightedFeatures: frame.highlights.map((h) => ({
          id: h.featureId,
          layerId: h.layerId,
        })),
        layerConfig: state.layerConfig.map((l) => ({
          ...l,
          visible: frame.visibleLayers.includes(l.id),
        })),
        // Ensure detail panels stay closed when jumping frames
        selectedFeature: null,
        layerSubState: {},
      };
    }

    case "EXIT_STORY": {
      return {
        ...state,
        isStoryModeActive: false,
        storyManifest: null,
        currentStoryIndex: 0,
        highlightedFeatures: [],
        // Reset time to full range
        committedTimeRange: [
          state.settings.timeRange.min,
          state.settings.timeRange.max,
        ],
        liveTimeRange: [
          state.settings.timeRange.min,
          state.settings.timeRange.max,
        ],
        // Reset layers to their initial visibility and clear filters
        layerConfig: state.layerConfig.map((l) => {
          const initialLayer = initialLayerConfig.find(
            (init) => init.id === l.id
          );
          return {
            ...l,
            filterValues: {}, // Clear any leftover filters
            visible: initialLayer ? initialLayer.visible : true, // Restore default visibility
          };
        }),
      };
    }
    default:
      return state;
  }
};
