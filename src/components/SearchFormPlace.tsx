import SearchField from "./SearchField";
import type { FilterComponentProps } from "../types/state";
import { Paper, Stack, Typography } from "@mui/material";

function SearchFormPlace({ layer }: FilterComponentProps) {
  return (
    <Paper variant="outlined" sx={{ padding: 2, marginTop: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2">Location Filter</Typography>
        <SearchField layer={layer} label="City / Place" searchKey="location" />
      </Stack>
    </Paper>
  );
}

export default SearchFormPlace;
