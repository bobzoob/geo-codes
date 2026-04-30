import {
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppState } from "../../../state/appContext";
import { useActiveFilters } from "../../../hooks/useActiveFilters";

/**
 * This Panel just renderes the outcome, the logic happens in the
 * useActiveFilters hook
 */
function ActiveFiltersPanel() {
  const { state, dispatch } = useAppState();
  const { layerConfig, selectedLayerId } = state;

  const activeFilters = useActiveFilters();
  const selectedLayer = layerConfig.find((l) => l.id === selectedLayerId);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Typography variant="h6">
          {" "}
          {selectedLayer ? `Filters: ${selectedLayer.name}` : "Filters"}
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2 }}>
        {activeFilters.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            No filters active.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {activeFilters.map((filter) => (
              <Box
                key={filter.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1,
                  bgcolor: "rgba(255,255,255,0.05)",
                  borderRadius: 1,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {filter.label}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {filter.value}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() =>
                    dispatch({
                      type: "REMOVE_FILTER",
                      payload: {
                        layerId: filter.layerId,
                        moduleId: filter.moduleId,
                      },
                    })
                  }
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Stack spacing={1}>
          {selectedLayerId && (
            <Button
              variant="contained"
              fullWidth
              onClick={() =>
                dispatch({
                  type: "CLEAR_LAYER_FILTERS",
                  payload: selectedLayerId,
                })
              }
            >
              Clear This Layer
            </Button>
          )}
          <Divider />
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<DeleteIcon />}
            fullWidth
            onClick={() => dispatch({ type: "CLEAR_ALL_FILTERS" })}
          >
            Reset All Layers
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default ActiveFiltersPanel;
