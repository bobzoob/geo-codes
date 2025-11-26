import { Box, Typography, Stack, Button, Divider } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppState } from "../state/appContext";

function ActiveFiltersPanel() {
  const { state, dispatch } = useAppState();
  const { layerConfig, selectedLayerId, committedTimeRange } = state;

  const selectedLayer = layerConfig.find((l) => l.id === selectedLayerId);
  const search = selectedLayer?.search;

  // Helper to check if Time is active (changed from default)
  const isTimeFiltered =
    committedTimeRange[0] !== 1800 || committedTimeRange[1] !== 1960;

  // Collect active search filters
  const activeFilters: { label: string; value: string }[] = [];

  if (isTimeFiltered) {
    activeFilters.push({
      label: "Time Range",
      value: `${committedTimeRange[0]} - ${committedTimeRange[1]}`,
    });
  }

  if (search) {
    if (search.plainText)
      activeFilters.push({ label: "Text", value: `"${search.plainText}"` });
    if (search.sender)
      activeFilters.push({ label: "Sender", value: `"${search.sender}"` });
    if (search.recipient)
      activeFilters.push({
        label: "Recipient",
        value: `"${search.recipient}"`,
      });
    if (search.location)
      activeFilters.push({ label: "Location", value: `"${search.location}"` });
    if (search.searchStartDate)
      activeFilters.push({
        label: "Start Date",
        value: `>= ${search.searchStartDate}`,
      });
    if (search.searchEndDate)
      activeFilters.push({
        label: "End Date",
        value: `<= ${search.searchEndDate}`,
      });
  }

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
            {activeFilters.map((filter, index) => (
              <Box
                key={index}
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
