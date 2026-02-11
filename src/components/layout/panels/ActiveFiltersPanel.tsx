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
  const hasFilters = activeFilters.length > 0;

  const selectedLayer = layerConfig.find(
    (layer) => layer.id === selectedLayerId
  );

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        {selectedLayer ? `Filter for ${selectedLayer.name}` : "Filter"}
      </Typography>

      {!hasFilters ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          No filters active.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {/* list of filters */}
          <Stack spacing={1}>
            {activeFilters.map((filter) => (
              <Box
                key={filter.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "4px 8px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 1,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      display: "block",
                      lineHeight: 1,
                    }}
                  >
                    {filter.label}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {filter.value}
                  </Typography>
                </Box>

                {/* x button */}
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
                  sx={{
                    ml: 1,
                    opacity: 0.7,
                    "&:hover": { opacity: 1, color: "error.main" },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>

          {/* Clear buttons */}
          <Stack spacing={1}>
            {selectedLayerId && (
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  dispatch({
                    type: "CLEAR_LAYER_FILTERS",
                    payload: selectedLayerId,
                  })
                }
                fullWidth
              >
                Clear {selectedLayer?.name || "Layer"} Filters
              </Button>
            )}
            <Divider />

            <Button
              variant="outlined"
              color="secondary"
              startIcon={<DeleteIcon />}
              size="small"
              onClick={() => dispatch({ type: "CLEAR_ALL_FILTERS" })}
              fullWidth
            >
              Reset (All Layers)
            </Button>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}

export default ActiveFiltersPanel;
