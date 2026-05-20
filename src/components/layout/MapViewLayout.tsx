import { useState } from "react";
import {
  Box,
  Paper,
  useMediaQuery,
  type Theme,
  ThemeProvider,
  Fab,
  Menu,
  MenuItem,
  Divider,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LayersIcon from "@mui/icons-material/Layers";
import SettingsIcon from "@mui/icons-material/Settings";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import TableChartIcon from "@mui/icons-material/TableChart";
import InfoIcon from "@mui/icons-material/Info";

import { useAppState } from "../../state/appContext";
import CollapsiblePanel from "./panels/CollapsiblePanel";
import LayerPanel from "./panels/LayerPanel";
import OptionsPanel from "./panels/OptionsPanel";
import ActiveFiltersPanel from "./panels/ActiveFiltersPanel";
import FeatureTablePanel from "./panels/FeatureTablePanel";
import FeatureDetailPanel from "./panels/FeatureDetailPanel";
import MapContainer from "../MapContainer";
import { mapTheme } from "../../config/mapTheme";
import TimelineControl from "../TimelineControl";
import StoryPanel from "./panels/StoryPanel"; // story mode

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
    selectedLayerId,
    layerConfig,
    isStoryModeActive,
  } = state;

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  const timelineOffset = isMobile ? 70 : 100;
  const timelineHeight = isMobile ? 180 : 250;

  // Universal Menu State
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

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

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const togglePanel = (
    panel: "layers" | "options" | "filters" | "table" | "detail"
  ) => {
    if (isMobile) {
      const nextState = activeMobilePanel === panel ? "none" : panel;
      dispatch({ type: "SET_ACTIVE_MOBILE_PANEL", payload: nextState as any });
    } else {
      switch (panel) {
        case "layers":
          dispatch({ type: "TOGGLE_LAYER_PANEL" });
          break;
        case "options":
          dispatch({ type: "TOGGLE_OPTIONS_PANEL" });
          break;
        case "filters":
          dispatch({ type: "TOGGLE_ACTIVE_FILTERS_PANEL" });
          break;
        case "table":
          dispatch({ type: "TOGGLE_TABLE_PANEL" });
          break;
        case "detail":
          dispatch({ type: "TOGGLE_DETAIL_PANEL" });
          break;
      }
    }
    handleMenuClose();
  };

  // get layer name
  const selectedLayer = layerConfig.find((l) => l.id === selectedLayerId);

  return (
    <Box
      sx={{
        height: isMobile ? "100dvh" : "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <MapContainer />

      <ThemeProvider theme={mapTheme}>
        {/* UNIVERSAL HAMBURGER MENU */}
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Fab color="primary" onClick={handleMenuClick} size="small">
            <MenuIcon />
          </Fab>
          {/* MASSEGE OPERATING LAYER */}
          <Paper
            elevation={4}
            sx={{
              px: 2,
              py: 0.5,
              borderRadius: "16px",
              backgroundColor: "rgba(20, 20, 20, 0.75)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              gap: 1,
              pointerEvents: "none", // So it doesn't block map clicks underneath
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                textTransform: "uppercase",
                fontWeight: "bold",
                letterSpacing: "0.05em",
              }}
            >
              Selected Layer:
            </Typography>
            <Typography
              variant="body2"
              color={selectedLayer ? "secondary.main" : "text.primary"}
              fontWeight="bold"
            >
              {selectedLayer ? selectedLayer.name : "None"}
            </Typography>
          </Paper>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => togglePanel("layers")}
              selected={isLayerVisible}
            >
              <LayersIcon
                sx={{ mr: 1, color: "text.secondary" }}
                fontSize="small"
              />{" "}
              Layers
            </MenuItem>
            <MenuItem
              onClick={() => togglePanel("options")}
              selected={isOptionsVisible}
            >
              <SettingsIcon
                sx={{ mr: 1, color: "text.secondary" }}
                fontSize="small"
              />{" "}
              Options
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => togglePanel("filters")}
              selected={isFiltersVisible}
            >
              <FilterAltIcon
                sx={{ mr: 1, color: "text.secondary" }}
                fontSize="small"
              />{" "}
              Filters
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => togglePanel("table")}
              selected={isTableVisible}
            >
              <TableChartIcon
                sx={{ mr: 1, color: "text.secondary" }}
                fontSize="small"
              />{" "}
              Data Table
            </MenuItem>
            <MenuItem
              onClick={() => togglePanel("detail")}
              selected={isDetailVisible}
            >
              <InfoIcon
                sx={{ mr: 1, color: "text.secondary" }}
                fontSize="small"
              />{" "}
              Details
            </MenuItem>
          </Menu>
        </Box>

        {/* PANEL ZONE */}
        <Box
          sx={{
            position: "absolute",
            top: 70, // Push down to clear the FAB on all screens
            left: 0,
            right: 0,
            bottom: `${timelineHeight}px`,
            padding: isMobile ? "8px" : "20px",
            paddingLeft: isMobile ? "16px" : "20px",
            display: "flex",
            gap: "15px",
            pointerEvents: "none",
            zIndex: 1000,
            overflowX: isMobile ? "hidden" : "auto",
            alignItems: "flex-start",
          }}
        >
          <CollapsiblePanel
            label="Story"
            isCollapsed={!isStoryModeActive}
            onToggle={() => {}} // StoryPanel cant be toggled manually, only via exit button
            maxWidth={400}
          >
            <StoryPanel />
          </CollapsiblePanel>

          <CollapsiblePanel
            label="Layers"
            isCollapsed={!isLayerVisible}
            onToggle={() => togglePanel("layers")}
            maxWidth={350}
          >
            <LayerPanel />
          </CollapsiblePanel>

          <CollapsiblePanel
            label="Options"
            isCollapsed={!isOptionsVisible}
            onToggle={() => togglePanel("options")}
            maxWidth={450}
          >
            <OptionsPanel />
          </CollapsiblePanel>

          <CollapsiblePanel
            label="Filters"
            isCollapsed={!isFiltersVisible}
            onToggle={() => togglePanel("filters")}
            maxWidth={300}
          >
            <ActiveFiltersPanel />
          </CollapsiblePanel>

          <CollapsiblePanel
            label="Data"
            isCollapsed={!isTableVisible}
            onToggle={() => togglePanel("table")}
            maxWidth={350}
          >
            <FeatureTablePanel />
          </CollapsiblePanel>
          <CollapsiblePanel
            label="Details"
            isCollapsed={!isDetailVisible}
            onToggle={() => togglePanel("detail")}
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
