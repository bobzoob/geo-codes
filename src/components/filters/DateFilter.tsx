import { Stack, TextField, Button, Paper, Typography } from "@mui/material";
import type { FilterComponentProps } from "../../types/filter";

// Define the shape of the value for this filter
interface DateRangeValue {
  start: string;
  end: string;
}

function DateFilter({ value, onChange }: FilterComponentProps) {
  // Default to empty strings if undefined
  const current = (value as DateRangeValue) || { start: "", end: "" };

  const update = (field: "start" | "end", val: string) => {
    onChange({ ...current, [field]: val });
  };

  const clear = () => onChange({ start: "", end: "" });

  return (
    <Paper variant="outlined" sx={{ padding: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2">Date Range</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Start"
            type="date"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={current.start}
            onChange={(e) => update("start", e.target.value)}
          />
          <TextField
            label="End"
            type="date"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={current.end}
            onChange={(e) => update("end", e.target.value)}
          />
        </Stack>
        {(current.start || current.end) && (
          <Button size="small" onClick={clear}>
            Clear
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

export default DateFilter;
