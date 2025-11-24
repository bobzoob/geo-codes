import { useState } from "react";
import { Stack, TextField, Button, Paper, Typography } from "@mui/material";
import type { FilterComponentProps } from "../types/state";
import { useAppState } from "../state/appContext";

function SearchFormDate({ layer }: FilterComponentProps) {
  const { dispatch } = useAppState();
  const [startDate, setStartDate] = useState(
    layer.search?.searchStartDate || ""
  );
  const [endDate, setEndDate] = useState(layer.search?.searchEndDate || "");

  const handleApply = () => {
    dispatch({
      type: "UPDATE_LAYER_SEARCH",
      payload: {
        layerId: layer.id,
        searchState: {
          ...layer.search!,
          searchStartDate: startDate,
          searchEndDate: endDate,
        },
      },
    });
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    dispatch({
      type: "UPDATE_LAYER_SEARCH",
      payload: {
        layerId: layer.id,
        searchState: {
          ...layer.search!,
          searchStartDate: "",
          searchEndDate: "",
        },
      },
    });
  };

  return (
    <Paper variant="outlined" sx={{ padding: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2">Date Filter</Typography>

        <Stack direction="row" spacing={2}>
          <TextField
            label="Start Date"
            type="date"
            variant="outlined"
            size="small"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            variant="outlined"
            size="small"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={handleApply}>
            Apply
          </Button>
          <Button size="small" onClick={handleClear}>
            Clear
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default SearchFormDate;
