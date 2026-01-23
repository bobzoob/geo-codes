import {
  Stack,
  TextField,
  Button,
  Paper,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import type { FilterComponentProps } from "../../types/filter";

interface PlaceFilterValue {
  searchTerm: string;
  onlyResolved: boolean;
}

function PlaceFilter({ value, onChange }: FilterComponentProps) {
  // default state
  const current = (value as PlaceFilterValue) || {
    searchTerm: "",
    onlyResolved: false,
  };

  const update = (updates: Partial<PlaceFilterValue>) => {
    onChange({ ...current, ...updates });
  };

  return (
    <Paper variant="outlined" sx={{ padding: 2, marginTop: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2">Place Filter</Typography>

        <TextField
          label="Search Place Name..."
          variant="outlined"
          size="small"
          fullWidth
          value={current.searchTerm}
          onChange={(e) => update({ searchTerm: e.target.value })}
        />

        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={current.onlyResolved}
              onChange={(e) => update({ onlyResolved: e.target.checked })}
            />
          }
          label={
            <Typography variant="caption">Only Geonames Resolved</Typography>
          }
        />

        {(current.searchTerm || current.onlyResolved) && (
          <Button
            size="small"
            onClick={() => onChange({ searchTerm: "", onlyResolved: false })}
          >
            Clear
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

export default PlaceFilter;
