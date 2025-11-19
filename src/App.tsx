import { Box, CssBaseline, Stack } from "@mui/material";
import Header from "./components/Header";
import LayerPanel from "./components/LayerPanel";
import MapContainer from "./components/MapContainer";
import Dashboard from "./components/Dashboard";
import { useAppState } from "./state/appContext";
import CollapsiblePanel from "./components/CollapsiblePanel";

// types
export type { TimeRange, View, SearchState, LayerConfig } from "./types/state";

function App() {
  // getcurrent state from our global context
  const { state, dispatch } = useAppState();
  const { currentView, geoJsonData, isLayerPanelCollapsed } = state;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <CssBaseline />
      <Header />
      <Stack direction="row" sx={{ flexGrow: 1 }}>
        {/* LayerPanel area */}
        {currentView === "map" && ( // will we only show the collapsible panel in map view?
          <CollapsiblePanel
            isCollapsed={isLayerPanelCollapsed}
            onToggle={() => dispatch({ type: "TOGGLE_LAYER_PANEL" })}
            width={240}
          >
            <LayerPanel />
          </CollapsiblePanel>
        )}

        <Box component="main" sx={{ flexGrow: 1, overflow: "auto" }}>
          {currentView === "dashboard" ? (
            <Dashboard isDataLoaded={geoJsonData !== null} />
          ) : (
            // MapContainer gets all its data from state
            <MapContainer />
          )}
        </Box>
      </Stack>
    </Box>
  );
}

export default App;
