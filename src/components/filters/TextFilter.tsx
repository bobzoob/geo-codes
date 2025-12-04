import { Stack, TextField, Button, Paper, Typography } from "@mui/material";
import type { FilterComponentProps } from "../../types/filter";

function TextFilter({ value, onChange }: FilterComponentProps) {
  // value is expected to be string here
  const currentValue = (value as string) || "";

  const handleChange = (text: string) => {
    onChange(text);
  };

  return (
    <Paper variant="outlined" sx={{ padding: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2">Text Search</Typography>
        <TextField
          label="Search..."
          variant="outlined"
          fullWidth
          size="small"
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
        />
        {currentValue && (
          <Button size="small" onClick={() => onChange("")}>
            Clear
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

export default TextFilter;
