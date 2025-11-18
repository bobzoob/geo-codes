import { useState } from "react";
import { Box, Button, Collapse, Stack, TextField } from "@mui/material";
import type { SearchState, FilterComponentProps } from "../types/state";
import { useAppState } from "../state/appContext";

// it receives FilterComponentProps
function SearchForm({ layer }: FilterComponentProps) {
  const { dispatch } = useAppState(); // and gets dispatch from the appContext, as it gets it from appReducer
  const [isOpen, setIsOpen] = useState(false);

  // but search state must already exist if this component is rendered
  // ! -> tells TypeScript that we are certain layer.search is not undefined, otherwise compeiler will complain
  const [formState, setFormState] = useState<SearchState>(layer.search!);

  const handleApply = () => {
    dispatch({
      type: "UPDATE_LAYER_SEARCH",
      payload: { layerId: layer.id, searchState: formState },
    });
  };

  const handleClear = () => {
    const clearedState = { plainText: "", sender: "", recipient: "" };
    setFormState(clearedState);
    dispatch({
      type: "UPDATE_LAYER_SEARCH",
      payload: { layerId: layer.id, searchState: clearedState },
    });
  };

  return (
    <Box sx={{ marginTop: 1 }}>
      <Button size="small" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "Hide Search" : "Show Search"}
      </Button>
      <Collapse in={isOpen}>
        <Stack spacing={2} sx={{ padding: 2, borderTop: "1px solid #eee" }}>
          <TextField
            label="Search All Text"
            variant="outlined"
            size="small"
            value={formState.plainText}
            onChange={(e) =>
              setFormState({ ...formState, plainText: e.target.value })
            }
          />
          <TextField
            label="Sender"
            variant="outlined"
            size="small"
            value={formState.sender}
            onChange={(e) =>
              setFormState({ ...formState, sender: e.target.value })
            }
          />
          <TextField
            label="Recipient"
            variant="outlined"
            size="small"
            value={formState.recipient}
            onChange={(e) =>
              setFormState({ ...formState, recipient: e.target.value })
            }
          />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" size="small" onClick={handleApply}>
              Apply
            </Button>
            <Button variant="outlined" size="small" onClick={handleClear}>
              Clear
            </Button>
          </Stack>
        </Stack>
      </Collapse>
    </Box>
  );
}

export default SearchForm;
