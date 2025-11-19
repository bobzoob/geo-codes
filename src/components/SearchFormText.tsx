import { useState } from "react";
import { Stack, TextField, Button } from "@mui/material";
import type { FilterComponentProps } from "../types/state";
import { useAppState } from "../state/appContext";

function SearchFormText({ layer }: FilterComponentProps) {
  const { dispatch } = useAppState();
  const [text, setText] = useState(layer.search?.plainText || "");

  const handleApply = () => {
    dispatch({
      type: "UPDATE_LAYER_SEARCH",
      payload: {
        layerId: layer.id,
        searchState: { ...layer.search!, plainText: text },
      },
    });
  };

  const handleClear = () => {
    setText("");
    dispatch({
      type: "UPDATE_LAYER_SEARCH",
      payload: {
        layerId: layer.id,
        searchState: { ...layer.search!, plainText: "" },
      },
    });
  };

  return (
    <Stack spacing={1}>
      <TextField
        label="Search Name/Description"
        variant="outlined"
        fullWidth
        size="small"
        value={text}
        onChange={(e) => setText(e.target.value)}
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

export default SearchFormText;
