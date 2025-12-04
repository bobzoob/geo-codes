// provider wraps up tje application, making state available to every other class

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import { appReducer, type AppState, type AppAction } from "./appReducer";
import type { HistoricalFeatureCollection } from "../types/geojson";
import { initialLayerConfig } from "../config/layers";
import { APP_CONFIG } from "../config/appConfig";

// initial state of application
const initialState: AppState = {
  currentView: "dashboard",
  geoJsonData: null,
  entities: {},
  layerConfig: initialLayerConfig,
  committedTimeRange: [APP_CONFIG.timeRange.min, APP_CONFIG.timeRange.max],
  liveTimeRange: [APP_CONFIG.timeRange.min, APP_CONFIG.timeRange.max],
  selectedLayerId: null,
  isLayerPanelCollapsed: false,
  isOptionsPanelCollapsed: true,
  activeMobilePanel: "layers",
  isActiveFiltersPanelCollapsed: true,
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

  // data fetching logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        //fetch dictionary entites
        const entitiesRes = await fetch("/entities.json");
        const entitiesData = await entitiesRes.json();

        dispatch({ type: "SET_ENTITIES", payload: entitiesData });

        // fetch layers
        const promises = state.layerConfig.map((layer) =>
          fetch(layer.source).then((res) => res.json())
        );
        const responses = await Promise.all(promises);

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
    <AppStateContext.Provider value={{ state, dispatch }}>
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
