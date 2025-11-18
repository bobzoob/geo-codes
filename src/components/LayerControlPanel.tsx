import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography,
} from "@mui/material";
import type { LayerConfig } from "../App";
//import SearchForm from "./SearchForm";
import { useAppState } from "../state/appContext";

interface LayerControlPanelProps {
  layers: LayerConfig[];
}

function LayerControlPanel({ layers }: LayerControlPanelProps) {
  const { dispatch } = useAppState();

  return (
    <Box>
      <Typography variant="h6">Layers</Typography>
      {layers.map((layer) => {
        // FilterComponent loaded dynamically from layer config
        const FilterComponent = layer.FilterComponent;

        return (
          <Box
            key={layer.id}
            sx={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: 1,
              marginBottom: 1,
            }}
          >
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={layer.visible}
                    onChange={(event) =>
                      dispatch({
                        type: "SET_LAYER_VISIBILITY",
                        payload: {
                          layerId: layer.id,
                          isVisible: event.target.checked,
                        },
                      })
                    }
                  />
                }
                label={layer.name}
              />
              <FormControlLabel
                sx={{ marginLeft: 1 }}
                control={
                  <Checkbox
                    checked={layer.showAllTooltips}
                    onChange={(event) =>
                      dispatch({
                        type: "SET_LAYER_TOOLTIPS",
                        payload: {
                          layerId: layer.id,
                          showAll: event.target.checked,
                        },
                      })
                    }
                  />
                }
                label="show all tooltips"
              />
            </FormGroup>

            {/* dynamic rendering logic */}
            {/* if there is FilterComponent and its defined for this layer, we render it */}
            {FilterComponent && <FilterComponent layer={layer} />}
          </Box>
        );
      })}
    </Box>
  );
}

export default LayerControlPanel;
