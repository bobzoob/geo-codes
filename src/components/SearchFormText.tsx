import { useState } from "react";
import { Stack, TextField, Button, Paper, Typography } from "@mui/material";
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
    <Paper variant="outlined" sx={{ padding: 2 }}>
      <Stack spacing={2}>
        {/* heading */}
        <Typography variant="subtitle2">
          Mentioned Entities and Text Search
        </Typography>

        <TextField
          label="Search Entities/Name/Description"
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
    </Paper>
  );
}

export default SearchFormText;
