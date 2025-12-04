import { Box, Typography, Stack, Button, Divider } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppState } from "../../../state/appContext";
import { useActiveFilters } from "../../../hooks/useActiveFilters";

/**
 * This Panel just renderes the outcome, the logic happens in the
 * useActiveFilters hook
 */
function ActiveFiltersPanel() {
  const { dispatch } = useAppState();

  const activeFilters = useActiveFilters();
  const hasFilters = activeFilters.length > 0;

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Active Filters
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
          {/* List of Filters */}
          <Stack spacing={1}>
            {activeFilters.map((filter) => (
              <Box
                key={filter.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 1,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", textTransform: "uppercase" }}
                >
                  {filter.label}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {filter.value}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Divider />

          {/* Clear Button */}
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<DeleteIcon />}
            onClick={() => dispatch({ type: "CLEAR_ALL_FILTERS" })}
            fullWidth
          >
            Clear All
          </Button>
        </Stack>
      )}
    </Box>
  );
}

export default ActiveFiltersPanel;
