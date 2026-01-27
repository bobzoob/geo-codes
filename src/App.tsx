import { Box, CssBaseline } from "@mui/material";
import Header from "./components/layout/Header";
import Dashboard from "./components/Dashboard";
import Footer from "./components/layout/Footer";
import { useAppState } from "./state/appContext";
import MapViewLayout from "./components/layout/MapViewLayout";
import { ThemeProvider } from "@mui/material/styles";
import { mapTheme } from "./config/mapTheme";
import DocumentationView from "./components/DocumentationView";

/**
 * root component of the application
 * responsibility is rendering Header, switching between main Dashboard and MapContainer view
 */

function App() {
  const { state } = useAppState();
  const { currentView } = state;

  // 2. Helper function to determine which view to render
  const renderCurrentView = () => {
    switch (currentView) {
      case "map":
        return <MapViewLayout />;
      case "documentation":
        return <DocumentationView />;
      case "dashboard":
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider theme={mapTheme}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <CssBaseline />
        <Header />

        {/* this is the main content area that fills the remeining space */}
        <Box sx={{ flexGrow: 1, position: "relative" }}>
          {renderCurrentView()}
        </Box>
        <Footer />
      </Box>{" "}
    </ThemeProvider>
  );
}

export default App;
