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
                className={isSelected ? "LayerCard active" : "LayerCard"}
                elevation={isSelected ? 4 : 1}
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
