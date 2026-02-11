import { Autocomplete, TextField, Paper, Stack } from "@mui/material";
import { useAppState } from "../../state/appContext";
import type { FilterComponentProps } from "../../types/filter";

function EntityFilter({
  layerId,
  value,
  onChange,
  label,
  params,
}: FilterComponentProps) {
  const { state } = useAppState();
  const { dictionaries, layerConfig, sources } = state;

  // 1. Logic: Should we even show suggestions?
  const useSuggestions = params?.useSuggestions === true;

  // 2. If suggestions are enabled, prepare the list
  let uniqueOptions: string[] = [];

  if (useSuggestions) {
    const layer = layerConfig.find((l) => l.id === layerId);
    const source = layer ? sources[layer.sourceId] : null;
    const dictionaryId = layer?.dictionaryId || source?.dictionaryId;
    const dictionary = dictionaryId ? dictionaries[dictionaryId] : {};

    const options = Object.values(dictionary)
      .filter((entity) => {
        // Filter by type if specified (e.g., "Place" or "Person")
        if (params?.suggestionType) {
          return (
            entity.type?.toLowerCase() === params.suggestionType.toLowerCase()
          );
        }
        return true;
      })
      .map((entity) => entity.name)
      .sort();

    uniqueOptions = Array.from(new Set(options));
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        padding: 2,
        bgcolor: "transparent",
        border: "1px solid rgba(255,255,255,0.1)",
        marginTop: 1,
      }}
    >
      <Stack spacing={1}>
        {useSuggestions ? (
          <Autocomplete
            freeSolo
            options={uniqueOptions}
            value={value || ""}
            // Update state when an option is selected or typed
            onChange={(_e, newValue) => onChange(newValue || "")}
            onInputChange={(_e, newInputValue) => onChange(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                variant="outlined"
                size="small"
                fullWidth
              />
            )}
          />
        ) : (
          <TextField
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            label={label}
            variant="outlined"
            size="small"
            fullWidth
          />
        )}
      </Stack>
    </Paper>
  );
}

export default EntityFilter;
