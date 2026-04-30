import { Stack, TextField, Button, Paper, Autocomplete } from "@mui/material";
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
  const { dictionaries, layerConfig, sources, processedData } = state;

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

    // Get the actual features for this layer from the reactive pipeline
    const layerData = processedData[layerId];
    const features = layerData?.features || [];

    // 1. Collect unique IDs from the specific fields
    const activePlaceIds = new Set<string>();

    features.forEach((f: any) => {
      const origin = f.properties?.origin_id;
      const target = f.properties?.target_id;
      if (origin) activePlaceIds.add(String(origin));
      if (target) activePlaceIds.add(String(target));
    });

    // 2. Map those IDs to Names using the dictionary
    const options = Array.from(activePlaceIds)
      .map((id) => dictionary[id]?.name)
      .filter(Boolean) // Remove undefined if an ID isn't in the dictionary
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
