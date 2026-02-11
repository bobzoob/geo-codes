import {
  Stack,
  TextField,
  Button,
  Paper,
  Typography,
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from "@mui/material";
import { useAppState } from "../../state/appContext";
import type { FilterComponentProps } from "../../types/filter";

interface PlaceFilterValue {
  searchTerm: string;
  onlyResolved: boolean;
}

function PlaceFilter({
  layerId,
  value,
  onChange,
  params,
}: FilterComponentProps) {
  const { state } = useAppState();
  const { dictionaries, layerConfig, sources } = state;

  // 1. Handle State Defaults
  const current = (value as PlaceFilterValue) || {
    searchTerm: "",
    onlyResolved: false,
  };

  const update = (updates: Partial<PlaceFilterValue>) => {
    onChange({ ...current, ...updates });
  };

  // 2. Suggestion Logic (Generic & Dictionary-Aware)
  const useSuggestions = params?.useSuggestions === true;
  let uniqueOptions: string[] = [];

  if (useSuggestions) {
    const layer = layerConfig.find((l) => l.id === layerId);
    const source = layer ? sources[layer.sourceId] : null;
    const dictionaryId = layer?.dictionaryId || source?.dictionaryId;
    const dictionary = dictionaryId ? dictionaries[dictionaryId] : {};

    const options = Object.values(dictionary)
      .filter((entity) => {
        // Filter by type (default to "Place" if not specified in params)
        const targetType = params?.suggestionType || "Place";
        return entity.type?.toLowerCase() === targetType.toLowerCase();
      })
      .map((entity) => entity.name)
      .sort();

    uniqueOptions = Array.from(new Set(options));
  }

  return (
    <Paper variant="outlined" sx={{ padding: 2, bgcolor: "transparent" }}>
      <Stack spacing={2}>
        {/* <Typography variant="subtitle2" color="primary">
          {label || "Place Filter"}
        </Typography> */}

        {/* SEARCH FIELD: Autocomplete or Standard TextField */}
        {useSuggestions ? (
          <Autocomplete
            freeSolo
            options={uniqueOptions}
            value={current.searchTerm}
            onChange={(_e, newValue) => update({ searchTerm: newValue || "" })}
            onInputChange={(_e, newInputValue) =>
              update({ searchTerm: newInputValue })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Place..."
                variant="outlined"
                size="small"
                fullWidth
              />
            )}
          />
        ) : (
          <TextField
            label="Search Place Name..."
            variant="outlined"
            size="small"
            fullWidth
            value={current.searchTerm}
            onChange={(e) => update({ searchTerm: e.target.value })}
          />
        )}

        {/* RESOLVED CHECKBOX (Development/Specific Logic) */}
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

        {/* CLEAR BUTTON */}
        {(current.searchTerm || current.onlyResolved) && (
          <Button
            size="small"
            variant="text"
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
