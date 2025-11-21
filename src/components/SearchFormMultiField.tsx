import { Stack, Typography, Paper, TextField } from "@mui/material";
import type { SearchState, FilterComponentProps } from "../types/state";

import SearchField from "./SearchField";

/**
 * this is a container to group multiple search fields
 */

function SearchFormMultiField({ layer }: FilterComponentProps) {
  return (
    <Paper variant="outlined" sx={{ padding: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2">Search Filters</Typography>
        {/* Arrange the individual search fields horizontally */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <SearchField layer={layer} label="All Text" searchKey="plainText" />
          <SearchField layer={layer} label="Sender" searchKey="sender" />
          <SearchField layer={layer} label="Recipient" searchKey="recipient" />
        </Stack>
      </Stack>
    </Paper>
  );
}

export default SearchFormMultiField;
