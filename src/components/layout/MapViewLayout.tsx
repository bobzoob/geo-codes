import {
  Box,
  Paper,
  useMediaQuery,
  type Theme,
  ThemeProvider,
} from "@mui/material";
import { useAppState } from "../../state/appContext";
import CollapsiblePanel from "./panels/CollapsiblePanel";
import LayerPanel from "./panels/LayerPanel";
import OptionsPanel from "./panels/OptionsPanel";
import ActiveFiltersPanel from "./panels/ActiveFiltersPanel";
import FeatureTablePanel from "./panels/FeatureTablePanel";
import MapContainer from "../MapContainer";
import { mapTheme } from "../../config/mapTheme";
import TimelineControl from "../TimelineControl";
import FeatureDetailPanel from "./panels/FeatureDetailPanel";

function MapViewLayout() {
  const { state, dispatch } = useAppState();
  const {
    isLayerPanelCollapsed,
    isOptionsPanelCollapsed,
    isActiveFiltersPanelCollapsed,
    isTablePanelCollapsed,
    isDetailPanelCollapsed,
    activeMobilePanel,
    liveTimeRange,
  } = state;

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  // Define the height of the timeline area to prevent overlap
  const timelineOffset = isMobile ? 70 : 100;
  const timelineHeight = isMobile ? 180 : 250; // "wall" for all panels

  // Panel Visibility Logic
  const isLayerVisible = isMobile
    ? activeMobilePanel === "layers"
    : !isLayerPanelCollapsed;
  const isOptionsVisible = isMobile
    ? activeMobilePanel === "options"
    : !isOptionsPanelCollapsed;
  const isFiltersVisible = isMobile
    ? activeMobilePanel === "filters"
    : !isActiveFiltersPanelCollapsed;
  const isTableVisible = isMobile
    ? activeMobilePanel === "table"
    : !isTablePanelCollapsed;
  const isDetailVisible = isMobile
    ? activeMobilePanel === "detail"
    : !isDetailPanelCollapsed;

  // Helper for mobile: Opening one closes others
  const toggleMobile = (
    panel: "layers" | "options" | "filters" | "table" | "detail"
  ) => {
    const nextState = activeMobilePanel === panel ? "none" : panel;
    dispatch({ type: "SET_ACTIVE_MOBILE_PANEL", payload: nextState as any });
  };

  return (
    <Box
      sx={{
        height: isMobile ? "100dvh" : "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden", // to lock viewport
      }}
    >
      <MapContainer />

      <ThemeProvider theme={mapTheme}>
        {/* PANEL ZONE: Restricted by bottom offset */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,

            bottom: `${timelineHeight}px`,
            padding: isMobile ? "8px" : "20px",
            paddingLeft: isMobile ? "8px" : "60px",
            display: "flex",
            gap: "15px",
            pointerEvents: "none",
            zIndex: 1000,
            overflowX: isMobile ? "auto" : "hidden",
            alignItems: "flex-start",
          }}
        >
          <CollapsiblePanel
            label="Layers"
            isCollapsed={!isLayerVisible}
            onToggle={() =>
              isMobile
                ? toggleMobile("layers")
                : dispatch({ type: "TOGGLE_LAYER_PANEL" })
            }
            maxWidth={350}
          >
            <LayerPanel />
          </CollapsiblePanel>

          <CollapsiblePanel
            label="Options"
            isCollapsed={!isOptionsVisible}
            onToggle={() =>
              isMobile
                ? toggleMobile("options")
                : dispatch({ type: "TOGGLE_OPTIONS_PANEL" })
            }
            maxWidth={450}
          >
            <OptionsPanel />
          </CollapsiblePanel>

          <CollapsiblePanel
            label="Filters"
            isCollapsed={!isFiltersVisible}
            onToggle={() =>
              isMobile
                ? toggleMobile("filters")
                : dispatch({ type: "TOGGLE_ACTIVE_FILTERS_PANEL" })
            }
            maxWidth={300}
          >
            <ActiveFiltersPanel />
          </CollapsiblePanel>

          <CollapsiblePanel
            label="Data"
            isCollapsed={!isTableVisible}
            onToggle={() =>
              isMobile
                ? toggleMobile("table")
                : dispatch({ type: "TOGGLE_TABLE_PANEL" })
            }
            maxWidth={300}
          >
            <FeatureTablePanel />
          </CollapsiblePanel>
          <CollapsiblePanel
            label="Detail"
            isCollapsed={!isDetailVisible}
            onToggle={() =>
              isMobile
                ? toggleMobile("detail")
                : dispatch({ type: "TOGGLE_DETAIL_PANEL" })
            }
            maxWidth={350}
          >
            <FeatureDetailPanel />
          </CollapsiblePanel>
        </Box>

        {/* TIMELINE ZONE */}
        <Box
          sx={{
            position: "absolute",
            bottom: `${timelineOffset}px`,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 1100,
            pointerEvents: "none",
          }}
        >
          <Paper
            elevation={6}
            sx={{
              width: isMobile ? "92%" : "75%",
              p: isMobile ? "10px" : "10px 40px",
              borderRadius: "12px",
              pointerEvents: "auto",
              bgcolor: "background.paper",
              backdropFilter: "blur(8px)",
            }}
          >
            <TimelineControl
              range={liveTimeRange}
              onTimeChange={(val) =>
                dispatch({ type: "SET_LIVE_TIME_RANGE", payload: val })
              }
              onTimeChangeCommitted={(val) =>
                dispatch({ type: "SET_COMMITTED_TIME_RANGE", payload: val })
              }
            />
          </Paper>
        </Box>
      </ThemeProvider>
    </Box>
  );
}

export default MapViewLayout;
