import { useState } from "react";
import { Box, Button, Collapse, Stack } from "@mui/material";
import type { SearchState, FilterComponentProps } from "../types/state";
import { useAppState } from "../state/appContext";
import SearchFormText from "./SearchFormText";
import SearchFormDate from "./SearchFormDate";

//  main component: will be assigned in the layer config
function PointFilterContainer({ layer }: FilterComponentProps) {
  const { dispatch } = useAppState();
  const [isOpen, setIsOpen] = useState(false);

  // local state to manage all child forms before dispatching
  const [formState, setFormState] = useState<SearchState>(layer.search!);

  const handleApply = () => {
    dispatch({
      type: "UPDATE_LAYER_SEARCH",
      payload: { layerId: layer.id, searchState: formState },
    });
  };

  const handleClear = () => {
    const clearedState = {
      ...layer.search!,
      plainText: "",
      searchStartDate: "",
      searchEndDate: "",
    };
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
          {/*reusable atomic components */}
          <SearchFormText
            searchState={formState}
            onSearchChange={setFormState}
          />
          <SearchFormDate
            searchState={formState}
            onSearchChange={setFormState}
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

export default PointFilterContainer;
