import { Stack, TextField } from "@mui/material";
import type { SearchState } from "../types/state";

interface SearchFormDateProps {
  searchState: SearchState;
  onSearchChange: (newSearchState: SearchState) => void;
}

function SearchFormDate({ searchState, onSearchChange }: SearchFormDateProps) {
  return (
    <Stack direction="row" spacing={2}>
      <TextField
        label="Start Date"
        type="date"
        variant="outlined"
        size="small"
        value={searchState.searchStartDate || ""}
        onChange={(e) =>
          onSearchChange({ ...searchState, searchStartDate: e.target.value })
        }
        InputLabelProps={{ shrink: true }} // keep label from overlapping -> expanded function
      />
      <TextField
        label="End Date"
        type="date"
        variant="outlined"
        size="small"
        value={searchState.searchEndDate || ""}
        onChange={(e) =>
          onSearchChange({ ...searchState, searchEndDate: e.target.value })
        }
        InputLabelProps={{ shrink: true }}
      />
    </Stack>
  );
}

export default SearchFormDate;
