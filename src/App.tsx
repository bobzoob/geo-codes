import { Box, CssBaseline } from "@mui/material";
import Header from "./components/layout/Header";
import Dashboard from "./components/Dashboard";

import { useAppState } from "./state/appContext";
import MapViewLayout from "./components/layout/MapViewLayout";
import { ThemeProvider } from "@mui/material/styles";
import { mapTheme } from "./config/mapTheme";
import DocumentationView from "./components/views/DocumentationView";
import LicenseView from "./components/views/LicenseView";
import PrivacyView from "./components/views/PrivacyView";

/**
 * root component of the application
 * responsibility is rendering Header, switching between main Dashboard and MapContainer view
 */

function App() {
  const { state } = useAppState();
  const { currentView } = state;

  // Helper function to determine which view to render
  const renderCurrentView = () => {
    switch (currentView) {
      case "map":
        return <MapViewLayout />;
      case "documentation":
        return <DocumentationView />;
      case "license":
        return <LicenseView />;
      case "privacy":
        return <PrivacyView />;
      case "dashboard":
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider theme={mapTheme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
        }}
      >
        <CssBaseline />
        <Header />

        {/* this is the main content area that fills the remeining space */}
        <Box sx={{ flexGrow: 1, position: "relative", minHeight: 0 }}>
          {renderCurrentView()}
        </Box>
      </Box>{" "}
    </ThemeProvider>
  );
}

export default App;
