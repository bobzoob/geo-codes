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
        <Typography variant="h6" color="secondary">
          Layers
        </Typography>
      </Box>

      {/* SCROLLABLE CONTENT */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, pb: 2 }}>
        <Stack spacing={1.5}>
          {visibleLayers.map((layer) => {
            const isSelected = layer.id === selectedLayerId;

            return (
              <Paper
                key={layer.id}
                className={isSelected ? "LayerCard active" : "LayerCard"}
                elevation={isSelected ? 4 : 1}
                onClick={() => handleSelectLayer(layer.id)}
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s",
                  borderLeft: isSelected
                    ? "4px solid"
                    : "4px solid transparent",
                  borderColor: "secondary.main",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ p: 1.5 }}
                  alignItems="flex-start"
                >
                  {/* Visibility Switch */}
                  <Switch
                    checked={layer.visible}
                    size="small"
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

                  {/* Text Content Area */}
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    {/* Line 1: Title + Tag */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                    >
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        sx={{
                          lineHeight: 1.2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {layer.name}
                      </Typography>
                    </Stack>

                    {/* Line 2: Subtitle */}
                    {layer.subtitle && (
                      <Typography
                        variant="body2"
                        sx={{
                          lineHeight: 1.2,
                          mt: 0.3,
                          // opacity: 0.9,
                          fontSize: "0.8rem",
                          fontStyle: "italic",
                        }}
                      >
                        {layer.subtitle}
                      </Typography>
                    )}

                    {/* Line 3: Description */}
                    {layer.description && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          marginTop: 0.8,
                          //opacity: 0.9,
                          lineHeight: 1.3,
                          fontSize: "0.8rem",
                        }}
                      >
                        {layer.description}
                      </Typography>
                    )}
                    {layer.tag && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.6rem",
                          fontWeight: 900,
                          textTransform: "uppercase",
                          color: "secondary.main",
                          bgcolor: "rgba(255, 152, 0, 0.1)",
                          px: 0.5,
                          borderRadius: 0.5,
                          letterSpacing: "0.05em",
                        }}
                      >
                        {layer.tag}
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
