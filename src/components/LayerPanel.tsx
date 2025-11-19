import { Box, Button, Typography, Paper, Switch, Stack } from "@mui/material";
import { useAppState } from "../state/appContext";

function LayerPanel() {
  const { state, dispatch } = useAppState();
  const { currentView, layerConfig, selectedLayerId } = state;

  const handleSelectLayer = (layerId: string) => {
    const newSelectedId = selectedLayerId === layerId ? null : layerId;
    dispatch({ type: "SELECT_LAYER", playload: newSelectedId });
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6">Menu</Typography>
      <Button
        variant="text"
        onClick={() => dispatch({ type: "SET_VIEW", payload: "dashboard" })}
      >
        Home
      </Button>
      {currentView === "map" && (
        <Box mt={4}>
          <Typography variant="h6">Layers</Typography>
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
                  borderColor: isSelected ? "primary.main" : "transparent",
                  transition: "all 0.2s",
                  backgroundColor: isSelected
                    ? "action.selected"
                    : "transparent",
                  "&:hover": {
                    borderColor: isSelected ? "primary.main" : "grey.400",
                  },
                }}
                onClick={() => handleSelectLayer(layer.id)}
              >
                <Stack spacing={0.5} alignItems="center">
                  {/* Item 1: The Layer Name */}
                  <Typography variant="body1" fontWeight="medium">
                    {layer.name}
                  </Typography>

                  {/* Item 2: The Visibility Switch */}
                  <Switch
                    checked={layer.visible}
                    // This is crucial: it stops the click from triggering the Paper's onClick
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
