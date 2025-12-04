import { Stack, TextField, Button, Paper, Typography } from "@mui/material";
import type { FilterComponentProps } from "../../types/filter";

function EntityFilter({ value, onChange, label }: FilterComponentProps) {
  const currentValue = (value as string) || "";

  return (
    <Paper variant="outlined" sx={{ padding: 2, marginTop: 2 }}>
      <Stack spacing={2}>
        {/* we use the passed label from filter.ts, or fallback to "Entity Filter" */}
        <Typography variant="subtitle2">{label || "Entity Filter"}</Typography>

        <TextField
          label="Name / ID"
          variant="outlined"
          size="small"
          fullWidth
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
        />
        {currentValue && (
          <Button size="small" onClick={() => onChange("")}>
            Clear
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

export default EntityFilter;
