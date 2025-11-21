import { useState } from "react";
import { Stack, TextField, Button } from "@mui/material";
import type { LayerConfig, SearchState } from "../types/state";
import { useAppState } from "../state/appContext";

interface SearchFieldProps {
  layer: LayerConfig;
  label: string; // "Sender", "Recipient"
  searchKey: keyof SearchState; // specific key in the state to update "sender"
}

/**
 * this is a self-contained "micro-form" for a single text-based search
 * it manages its own input state and dispatches updates for a specific key in the layers search state
 */
function SearchField({ layer, label, searchKey }: SearchFieldProps) {
  const { dispatch } = useAppState();

  const [value, setValue] = useState(layer.search?.[searchKey] || "");
  const handleApply = () => {
    dispatch({
      type: "UPDATE_LAYER_SEARCH",
      payload: {
        layerId: layer.id,
        searchState: { ...layer.search!, [searchKey]: value },
      },
    });
  };

  const handleClear = () => {
    setValue(""); // clear
    dispatch({
      type: "UPDATE_LAYER_SEARCH",
      payload: {
        layerId: layer.id,
        searchState: { ...layer.search!, [searchKey]: "" },
      },
    });
  };

  return (
    <Stack spacing={1}>
      <TextField
        label={label}
        variant="outlined"
        size="small"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={handleApply}>
          Apply
        </Button>
        <Button size="small" onClick={handleClear}>
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}

export default SearchField;
