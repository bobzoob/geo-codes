import { Box, CssBaseline } from "@mui/material";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import { useAppState } from "./state/appContext";
import MapViewLayout from "./components/MapViewLayout";
import { ThemeProvider, createTheme } from "@mui/material/styles";

/**
 * root component of the application
 * responsibility is rendering Header, switching between main Dashboard and MapContainer view
 */

const theme = createTheme();

function App() {
  const { state } = useAppState();
  const { currentView, geoJsonData } = state;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <CssBaseline />
        <Header />

        {/* this is the main content area that fills the remeining space */}
        <Box sx={{ flexGrow: 1, position: "relative" }}>
          {currentView === "dashboard" ? (
            <Dashboard isDataLoaded={geoJsonData !== null} />
          ) : (
            <MapViewLayout />
          )}
        </Box>
      </Box>{" "}
    </ThemeProvider>
  );
}

export default App;
