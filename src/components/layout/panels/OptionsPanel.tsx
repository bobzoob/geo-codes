import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  type Theme,
} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { useAppState } from "../../../state/appContext";
import { SearchSection } from "../../options/SearchSection";

function OptionsPanel() {
  const { state, dispatch } = useAppState();
  const { layerConfig, selectedLayerId } = state;

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  const selectedLayer = layerConfig.find(
    (layer) => layer.id === selectedLayerId
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* HEADER */}
      <Box
        sx={{
          p: 2,
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          {selectedLayer ? `Options: ${selectedLayer.name}` : "Options"}
        </Typography>
        <IconButton
          size="small"
          onClick={() =>
            isMobile
              ? dispatch({ type: "SET_ACTIVE_MOBILE_PANEL", payload: "none" })
              : dispatch({ type: "TOGGLE_OPTIONS_PANEL" })
          }
        >
          <KeyboardArrowLeftIcon />
        </IconButton>
      </Box>

      {/* SCROLLABLE CONTENT */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, pb: 2 }}>
        {!selectedLayer ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            Select a layer to view options.
          </Typography>
        ) : (
          <SearchSection layer={selectedLayer} />
        )}
      </Box>
    </Box>
  );
}

export default OptionsPanel;
