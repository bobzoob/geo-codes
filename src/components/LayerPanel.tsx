import { Box, Typography, Paper, Switch, Stack } from "@mui/material";
import { useAppState } from "../state/appContext";

function LayerPanel() {
  const { state, dispatch } = useAppState();
  const { currentView, layerConfig, selectedLayerId } = state;

  const handleSelectLayer = (layerId: string) => {
    const newSelectedId = selectedLayerId === layerId ? null : layerId;
    dispatch({ type: "SELECT_LAYER", payload: newSelectedId });
  };

  return (
    <Box sx={{ padding: 1.5 }}>
      {currentView === "map" && (
        <Box mt={2}>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Layers
          </Typography>
          {layerConfig.map((layer) => {
            const isSelected = layer.id === selectedLayerId;
            return (
              <Paper
                key={layer.id}
                elevation={isSelected ? 4 : 1}
                sx={{
                  paddingY: 1,
                  paddingX: 2,
                  marginBottom: 1,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundImage: "none",
                  backgroundColor: isSelected
                    ? "rgba(144, 202, 249, 0.18)" // Selected: Faint Blue Glass
                    : "transparent", // Unselected: Fully Transparent

                  borderColor: isSelected ? "primary.main" : "transparent",
                  borderWidth: "1px",
                  borderStyle: "solid",

                  "&:hover": {
                    borderColor: isSelected ? "primary.main" : "divider",
                    backgroundColor: isSelected
                      ? "rgba(144, 202, 249, 0.25)"
                      : "rgba(255, 255, 255, 0.05)",
                  },
                }}
                onClick={() => handleSelectLayer(layer.id)}
              >
                <Stack spacing={0.5} alignItems="center">
                  {/*layer name */}
                  <Typography variant="body1" fontWeight="medium">
                    {layer.name}
                  </Typography>

                  {/* visibility switch */}
                  <Switch
                    checked={layer.visible}
                    // this is crucial: it stops the click from triggering onClick
                    onClick={(e) => e.stopPropagation()}
                    onChange={(event) =>
                      dispatch({
                        type: "SET_LAYER_VISIBILITY",
                        payload: {
                          layerId: layer.id,
                          isVisible: event.target.checked,
                        },
                      })
                    }
                  />
                </Stack>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default LayerPanel;
