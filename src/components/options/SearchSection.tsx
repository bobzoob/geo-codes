import {
  Box,
  Typography,
  Stack,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { LayerConfig } from "../../types/state";
import { useAppState } from "../../state/appContext";
import { FilterList } from "./FilterList";

// this function handels the display of options on the options panel
// based on the areas implemented in layerConfig in state.ts

interface SearchSectionProps {
  layer: LayerConfig;
}

export function SearchSection({ layer }: SearchSectionProps) {
  const { dispatch } = useAppState();

  // 1. Filter the config
  const searchFilters = layer.activeFilters.filter(
    (f) => f.placement === "search-area"
  );

  if (searchFilters.length === 0) return null;

  const standardFilters = searchFilters.filter((f) => !f.section);
  const advancedFilters = searchFilters.filter((f) => f.section === "advanced");

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Display Options
      </Typography>

      <Stack spacing={2} alignItems="flex-start">
        {/* Tooltip Toggle */}
        {/* ONLY RENDER IF THE FLAG IS TRUE */}
        {layer.hasFlashlight && (
          <FormControlLabel
            control={
              <Checkbox
                checked={layer.showAllTooltips}
                onChange={(e) =>
                  dispatch({
                    type: "SET_LAYER_TOOLTIPS",
                    payload: {
                      layerId: layer.id,
                      showAll: e.target.checked,
                    },
                  })
                }
              />
            }
            label="Show Near Tooltips (Flashlight)"
          />
        )}
        {/* Standard Filters */}
        <FilterList
          layerId={layer.id}
          filters={standardFilters}
          values={layer.filterValues || {}}
        />

        {/* Advanced Filters Accordion */}
        {advancedFilters.length > 0 && (
          <Accordion
            disableGutters
            elevation={0}
            sx={{
              width: "100%",
              backgroundColor: "transparent",
              "&:before": { display: "none" },
              border: "1px solid rgba(0, 0, 0, 0.12)",
              borderRadius: 1,
              marginTop: 2,
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Advanced Options</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 2, paddingTop: 0 }}>
              <FilterList
                layerId={layer.id}
                filters={advancedFilters}
                values={layer.filterValues}
              />
            </AccordionDetails>
          </Accordion>
        )}
      </Stack>
    </Box>
  );
}
