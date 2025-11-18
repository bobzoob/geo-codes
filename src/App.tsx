import { Box, CssBaseline, Stack } from "@mui/material";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MapContainer from "./components/MapContainer";
import Dashboard from "./components/Dashboard";
import { useAppState } from "./state/appContext";

// types
export type { TimeRange, View, SearchState, LayerConfig } from "./types/state";

function App() {
  // Get the current state from our global context
  const { state } = useAppState();
  const { currentView, geoJsonData } = state;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <CssBaseline />
      <Header />
      <Stack direction="row" sx={{ flexGrow: 1 }}>
        <Box
          component="aside"
          sx={{ width: 240, borderRight: "1px solid", borderColor: "divider" }}
        >
          {/* Sidebar now gets its data directly from the state */}
          <Sidebar />
        </Box>

        <Box component="main" sx={{ flexGrow: 1, overflow: "auto" }}>
          {currentView === "dashboard" ? (
            <Dashboard isDataLoaded={geoJsonData !== null} />
          ) : (
            // MapContainer now gets all its data from the state
            <MapContainer />
          )}
        </Box>
      </Stack>
    </Box>
  );
}

export default App;
