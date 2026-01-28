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
import { APP_CONFIG } from "../config/appConfig";
import { computeProcessedData } from "./selectors";

/**
 * provider class: wraps up tje application, making state available to every other class
 */

// initial state of application
const initialState: AppState = {
  currentView: "dashboard",
  geoJsonData: null,
  processedData: {},
  layerConfig: initialLayerConfig,
  committedTimeRange: [APP_CONFIG.timeRange.min, APP_CONFIG.timeRange.max],
  liveTimeRange: [APP_CONFIG.timeRange.min, APP_CONFIG.timeRange.max],
  selectedLayerId: null,
  isLayerPanelCollapsed: false,
  isOptionsPanelCollapsed: true,
  activeMobilePanel: "layers",
  isActiveFiltersPanelCollapsed: true,
  loadingProgress: 0,
  dictionaries: {},
};

// context
// we are creating a box, with eighter the state and dispatch or NULL.
// we initialize it with null
// <> generics: aListOfType<someType>
const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// here the provider component is created
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // DATA PIPELINE
  // memo value only recalculates when filter change
  const processedData = useMemo(() => {
    return computeProcessedData(state);
  }, [
    state.geoJsonData,
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

  // data fetching logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        // progress calculation
        const totalTasks =
          (APP_CONFIG.dictionaries?.length || 0) + state.layerConfig.length;
        let completedTasks = 0;

        // Helper to update progress
        const updateProgress = () => {
          completedTasks++;
          const percentage =
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 100;
          dispatch({ type: "SET_LOADING_PROGRESS", payload: percentage });
        };

        // Fetch all Dictionaries
        if (APP_CONFIG.dictionaries && APP_CONFIG.dictionaries.length > 0) {
          // create an array of fetch promises for all dictionaries
          const dictionaryPromises = APP_CONFIG.dictionaries.map(
            async (dictConfig) => {
              const res = await fetch(dictConfig.source);
              const data = await res.json();
              updateProgress(); // update progress for each completed dictionary fetch
              return { id: dictConfig.id, data };
            }
          );

          // await for them to load
          const loadedDictionaries = await Promise.all(dictionaryPromises);

          // convert array of loaded dictionaries into single map object
          const dictionariesMap: Record<string, EntityMap> = {};
          loadedDictionaries.forEach((dict) => {
            dictionariesMap[dict.id] = dict.data;
          });

          dispatch({ type: "SET_DICTIONARIES", payload: dictionariesMap });
        }

        // fetch layers
        const layerPromises = state.layerConfig.map(async (layer) => {
          const res = await fetch(layer.source);
          const json = await res.json();
          updateProgress(); // progress: ++/total
          return json;
        });

        const responses = await Promise.all(layerPromises);

        // map data to id#s
        const dataMap: Record<string, HistoricalFeatureCollection> = {};
        state.layerConfig.forEach((layer, index) => {
          dataMap[layer.id] = responses[index] as HistoricalFeatureCollection;
        });

        // send action to update state with fetched data
        dispatch({ type: "SET_GEOJSON_DATA", payload: dataMap });
      } catch (error) {
        console.error("Error fetching GeoJSON data:", error);
      }
    };
    fetchData();
    // this effect should run only once when the app loads.
    // if the layerConfig could change dynamically in the future, this need adjustment
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
