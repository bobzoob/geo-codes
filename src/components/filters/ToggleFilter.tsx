import {
  Stack,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
} from "@mui/material";
import type { FilterComponentProps } from "../../types/filter";

function ToggleFilter({ value, onChange, params }: FilterComponentProps) {
  const currentValues = value || {};

  const handleToggle = (id: string, checked: boolean) => {
    onChange({ ...currentValues, [id]: checked });
  };

  const toggles = params?.availableToggles || [];

  if (toggles.length === 0) return null;

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 1,
        mt: 1,
      }}
    >
      <Typography
        variant="caption"
        fontWeight="bold"
        color="primary"
        sx={{ mb: 1, display: "block", textTransform: "uppercase" }}
      >
        {/* Lable could go here*/}
      </Typography>
      <Stack spacing={0}>
        {toggles.map((t: { id: string; label: string }) => (
          <FormControlLabel
            key={t.id}
            control={
              <Checkbox
                size="small"
                checked={!!currentValues[t.id]}
                onChange={(e) => handleToggle(t.id, e.target.checked)}
              />
            }
            label={
              <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                {t.label}
              </Typography>
            }
          />
        ))}
      </Stack>
    </Box>
  );
}

export default ToggleFilter;
