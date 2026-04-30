import { Box, Typography, Paper, Switch, Stack } from "@mui/material";
import { useAppState } from "../../../state/appContext";

function LayerPanel() {
  const { state, dispatch } = useAppState();
  const { layerConfig, selectedLayerId } = state;

  const handleSelectLayer = (layerId: string) => {
    const newSelectedId = selectedLayerId === layerId ? null : layerId;
    dispatch({ type: "SELECT_LAYER", payload: newSelectedId });
  };

  // hide layer from layerPanel
  const visibleLayers = layerConfig.filter((l) => l.showInPanel !== false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* FIXED HEADER */}
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Typography variant="h6">Layers</Typography>
      </Box>

      {/* SCROLLABLE CONTENT */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, pb: 2 }}>
        <Stack spacing={1}>
          {visibleLayers.map((layer) => {
            const isSelected = layer.id === selectedLayerId;
            return (
              <Paper
                key={layer.id}
                className={isSelected ? "LayerCard active" : "LayerCard"}
                onClick={() => handleSelectLayer(layer.id)}
              >
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={2}
                  sx={{ p: 1 }}
                >
                  <Switch
                    checked={layer.visible}
                    size="small"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_LAYER_VISIBILITY",
                        payload: {
                          layerId: layer.id,
                          isVisible: e.target.checked,
                        },
                      })
                    }
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {layer.name}
                    </Typography>
                    {layer.description && (
                      <Typography
                        variant="caption"
                        sx={{ display: "block", opacity: 0.8 }}
                      >
                        {layer.description}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}

export default LayerPanel;
