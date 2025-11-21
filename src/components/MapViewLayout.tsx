import { Box, useMediaQuery, type Theme } from "@mui/material";
import { useAppState } from "../state/appContext";
import CollapsiblePanel from "./CollapsiblePanel";
import LayerPanel from "./LayerPanel";
import OptionsPanel from "./OptionsPanel";
import MapContainer from "./MapContainer";
import { ThemeProvider } from "@mui/material/styles";
import { mapTheme } from "../config/mapTheme";

/**
 * layout manager for the entire interactive map view
 * renders MapContainer as a base layer and orchestrates the display of all floating UI panels on top of it
 */
function MapViewLayout() {
  const { state, dispatch } = useAppState();
  const {
    isLayerPanelCollapsed,
    isOptionsPanelCollapsed,
    activeMobilePanel,
    selectedLayerId,
  } = state;

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );
  const layerPanelWidth = 240;
  const optionsPanelWidth = isMobile ? 300 : 500;

  const isLayerPanelVisible = isMobile
    ? activeMobilePanel === "layers"
    : !isLayerPanelCollapsed;
  const isOptionsPanelVisible = isMobile
    ? activeMobilePanel === "options"
    : !isOptionsPanelCollapsed;

  return (
    <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
      {/* Layer 1: map*/}
      <MapContainer />

      <ThemeProvider theme={mapTheme}>
        {/* Layer 2: UI panels */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            padding: "20px",
            paddingLeft: "60px",
            display: "flex",
            gap: "20px",
            pointerEvents: "none", // licks pass through to the map
            zIndex: 1000,
            // on mobile
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          {/* Panel 1: layerPanel */}
          <CollapsiblePanel
            label="Layers"
            isCollapsed={!isLayerPanelVisible}
            onToggle={() => {
              if (isMobile) {
                const nextState =
                  activeMobilePanel === "layers" ? "none" : "layers";
                dispatch({
                  type: "SET_ACTIVE_MOBILE_PANEL",
                  payload: nextState,
                });
              } else {
                dispatch({ type: "TOGGLE_LAYER_PANEL" });
              }
            }}
            width={layerPanelWidth}
          >
            <LayerPanel />
          </CollapsiblePanel>

          {/* Panel 2: OptionsPanel */}
          {selectedLayerId && (
            <CollapsiblePanel
              label="Options"
              isCollapsed={!isOptionsPanelVisible}
              onToggle={() => {
                if (isMobile) {
                  const nextState =
                    activeMobilePanel === "options" ? "none" : "options";
                  dispatch({
                    type: "SET_ACTIVE_MOBILE_PANEL",
                    payload: nextState,
                  });
                } else {
                  dispatch({ type: "TOGGLE_OPTIONS_PANEL" });
                }
              }}
              // pass dynamic width
              width={optionsPanelWidth}
            >
              <OptionsPanel />
            </CollapsiblePanel>
          )}
        </Box>
      </ThemeProvider>
    </Box>
  );
}

export default MapViewLayout;
