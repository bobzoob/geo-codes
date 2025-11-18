import { TextField } from "@mui/material";
import type { SearchState } from "../types/state";

// "controlled component" - state is managed by its parent
interface SearchFormTextProps {
  searchState: SearchState;
  onSearchChange: (newSearchState: SearchState) => void;
}

function SearchFormText({ searchState, onSearchChange }: SearchFormTextProps) {
  return (
    <TextField
      label="Search Name/Description"
      variant="outlined"
      fullWidth
      size="small"
      value={searchState.plainText}
      onChange={(e) =>
        onSearchChange({ ...searchState, plainText: e.target.value })
      }
    />
  );
}

export default SearchFormText;
