import { Box, Typography, Paper, Switch, Stack } from "@mui/material";
import { useAppState } from "../../../state/appContext";

function LayerPanel() {
  const { state, dispatch } = useAppState();
  const { currentView, layerConfig, selectedLayerId } = state;

  const handleSelectLayer = (layerId: string) => {
    const newSelectedId = selectedLayerId === layerId ? null : layerId;
    dispatch({ type: "SELECT_LAYER", payload: newSelectedId });
  };

  // hide layer from layerPanel
  const visibleLayers = layerConfig.filter((l) => l.showInPanel !== false);

  return (
    <Box sx={{ padding: 2 }}>
      {currentView === "map" && (
        <Box mt={2}>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Layers
          </Typography>
          {visibleLayers.map((layer) => {
            const isSelected = layer.id === selectedLayerId;

            return (
              <Paper
                key={layer.id}
                className={isSelected ? "LayerCard active" : "LayerCard"}
                elevation={isSelected ? 4 : 1}
                onClick={() => handleSelectLayer(layer.id)}
                sx={{ cursor: "pointer", mb: 1 }}
              >
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={2}
                  sx={{ width: "100%", p: 1 }}
                >
                  {/* visibility switch */}
                  <Switch
                    checked={layer.visible}
                    size="small"
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
                  {/* title & description */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="body1"
                      fontWeight="medium"
                      sx={{ lineHeight: 1.2 }}
                    >
                      {layer.name}
                    </Typography>

                    {/* description gets rendered only if it exists */}
                    {layer.description && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          marginTop: 0.5,
                          opacity: 0.8, // slightly transparent
                          lineHeight: 1.2,
                        }}
                      >
                        {layer.description}
                      </Typography>
                    )}
                  </Box>
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
