import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  useMemo,
} from "react";
import type { AppState } from "../types/state";
import { appReducer, type AppAction } from "./appReducer";
import type { EntityMap, HistoricalFeatureCollection } from "../types/geojson";
import { initialLayerConfig } from "../config/layers";
import { PROJECT_SETTINGS } from "../config/settings";
import { computeProcessedData } from "./selectors";
import {
  sources as sourcesRegistry,
  dictionaries as dictionariesConfig,
} from "../config/sources";

/**
 * provider class: wraps up tje application, making state available to every other class
 */

// initial state of application
const initialState: AppState = {
  currentView: "dashboard",

  //data
  rawSources: {},
  processedData: {},
  dictionaries: {},

  //config
  sources: sourcesRegistry,
  layerConfig: initialLayerConfig,

  // multifeature highlighting
  highlightedFeatures: [],

  // settings
  settings: {
    ...PROJECT_SETTINGS,
    map: {
      ...PROJECT_SETTINGS.map,
      // strange that we have to cast the tuple to number..?
      defaultCenter: PROJECT_SETTINGS.map.defaultCenter as [number, number],
    },
  },

  // global state
  committedTimeRange: [
    PROJECT_SETTINGS.timeRange.min,
    PROJECT_SETTINGS.timeRange.max,
  ],
  liveTimeRange: [
    PROJECT_SETTINGS.timeRange.min,
    PROJECT_SETTINGS.timeRange.max,
  ],

  // UI state
  selectedLayerId: null,
  isLayerPanelCollapsed: false,
  isOptionsPanelCollapsed: true,
  activeMobilePanel: "layers",
  isActiveFiltersPanelCollapsed: true,
  isTablePanelCollapsed: true,
  isDetailPanelCollapsed: true,
  loadingProgress: 0,

  isTableLoaded: false, // "placeholder" mode
  tablePage: {},
  selectedFeature: null,
  drilledDownFeature: null,
  layerSubState: {},

  // story mode state
  isStoryPanelCollapsed: true,
  isStoryModeActive: false,
  currentStoryIndex: 0,
  storyManifest: null,
};

const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// here the provider component is created
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // DATA PIPELINE
  // this is a blind engine, transforming
  // rawSource -> processedData
  // if: filters, time.range or layer config chenges

  const processedData = useMemo(() => {
    return computeProcessedData(state);
  }, [
    state.rawSources,
    state.layerConfig,
    state.committedTimeRange,
    state.dictionaries,
  ]);

  // then we merge the processed data into a state object for the rest of the app
  const contextValue = useMemo(
    () => ({
      state: { ...state, processedData },
      dispatch,
    }),
    [state, processedData]
  );

  // DATA FETCHING logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dictList = dictionariesConfig.map((dict) => ({
          id: dict.id,
          url: typeof dict.url === "string" ? dict.url : (dict as any).url,
        }));

        const sourceList = Object.values(sourcesRegistry);

        const totalTasks = sourceList.length + dictList.length;
        let completedTasks = 0;

        const updateProgress = () => {
          completedTasks++;
          dispatch({
            type: "SET_LOADING_PROGRESS",
            payload: Math.round((completedTasks / totalTasks) * 100), // percentage
          });
        };

        // fetch all dictionaries
        const dictionaryPromises = dictList.map(async (dict) => {
          const res = await fetch(dict.url);
          if (!res.ok)
            throw new Error(`Failed to fetch dictionary: ${dict.id}`);
          const data = await res.json();
          updateProgress();
          return { id: dict.id, data };
        });

        const loadedDictionaries = await Promise.all(dictionaryPromises);

        const dictionariesMap: Record<string, EntityMap> = {};
        loadedDictionaries.forEach((dict) => {
          dictionariesMap[dict.id] = dict.data;
        });
        console.log(
          "DEBUG: Dictionaries loaded into Map:",
          Object.keys(dictionariesMap)
        );
        dispatch({ type: "SET_DICTIONARIES", payload: dictionariesMap });

        // fentch raw data sources
        const sourcePromises = sourceList.map(async (sourceConf) => {
          const res = await fetch(sourceConf.url);
          if (!res.ok)
            throw new Error(`Failed to fetch source: ${sourceConf.id}`);
          const data = await res.json();
          updateProgress();
          return { id: sourceConf.id, data };
        });

        const loadedSources = await Promise.all(sourcePromises);

        const sourceDataMap: Record<string, HistoricalFeatureCollection> = {};
        loadedSources.forEach((source) => {
          sourceDataMap[source.id] = source.data;
        });

        dispatch({ type: "SET_RAW_SOURCES", payload: sourceDataMap });
      } catch (error) {
        console.error("Framework Initialization Error:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};

// custom hook -> easy access to context
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppProvider");
  }
  return context;
};
