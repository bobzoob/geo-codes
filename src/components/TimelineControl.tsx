import { Box, Slider, Typography } from "@mui/material";
import type { TimeRange } from "../types/state";
import { APP_CONFIG } from "../config/appConfig";

/**
 * THE TIMERANGE IS CONTROLLED IN appConfig
 */
interface TimelineControlProps {
  range: TimeRange;
  onTimeChange: (newRange: TimeRange) => void;
  onTimeChangeCommitted: (newRange: TimeRange) => void;
}
function TimelineControl({
  range,
  onTimeChange,
  onTimeChangeCommitted,
}: TimelineControlProps) {
  const minYear = APP_CONFIG.timeRange.min;
  const maxYear = APP_CONFIG.timeRange.max;

  return (
    <Box
      sx={{
        // backgroundColor: "background.paper",
        color: "text.primary",
        textTransform: "none",
        fontWeight: "bold",
        whiteSpace: "nowrap",
        boxShadow: 3,
        "&:hover": { backgroundColor: "action.paper" },
        zIndex: 1000, // very hight up in hirarchy of layers
      }}
    >
      <Typography id="range-slider" gutterBottom>
        Selected Time: {range[0]} - {range[1]}
      </Typography>
      <Slider
        // slider value default stting
        value={range}
        min={minYear}
        max={maxYear}
        // we can only select whole years
        step={1}
        // tooltip for selected value
        valueLabelDisplay="auto"
        // aria labelled by attribute: all interactiv elements must have a accessible name, here the name can not be retrieved from its tags, like button etc.
        aria-labelledby="range-slider"
        // onChange updates the LIVE state on every movement
        onChange={(_event, newValue) => {
          onTimeChange(newValue as TimeRange);
        }}
        // onChangeCommitted updates the FILTERING state on release
        onChangeCommitted={(_event, newValue) => {
          onTimeChangeCommitted(newValue as TimeRange);
        }}
      />
    </Box>
  );
}

export default TimelineControl;
