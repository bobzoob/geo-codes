import { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Slider,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  useMediaQuery,
  type Theme,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import type { TimeRange } from "../types/state";
import { useAppState } from "../state/appContext";

/**
 * TIMERANGE is retrieved from the global application state
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
  // get boundaries from state
  const { state } = useAppState();
  const { min, max } = state.settings.timeRange;
  const { speed, step, defaultWindow } = state.settings.animation;

  //mobile?
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  // animation
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAnimation = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startAnimation = () => {
    const currentDuration = range[1] - range[0];
    const totalPossibleDuration = max - min;

    // defaultWindow from config
    // because we have to change to a snippet, if full range is selected
    // for animation to work
    if (currentDuration >= totalPossibleDuration || range[1] >= max) {
      onTimeChangeCommitted([min, min + defaultWindow]);
    }

    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        const currentStart = range[0];
        const currentEnd = range[1];
        const duration = currentEnd - currentStart;
        //values set in config
        const nextStart = currentStart + step;
        const nextEnd = nextStart + duration;

        if (nextEnd <= max) {
          onTimeChangeCommitted([nextStart, nextEnd]);
        } else {
          stopAnimation();
        }
      }, speed); // values set in config
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, range, max, onTimeChangeCommitted, speed, step]);

  // TICK generator
  const marks = useMemo(() => {
    if (isMobile) return false;

    const span = max - min;
    let interval = 1;

    if (span > 500) interval = 100;
    else if (span > 200) interval = 50;
    else if (span > 100) interval = 20;
    else if (span > 50) interval = 10;
    else if (span > 20) interval = 5;
    else if (span > 10) interval = 2;

    const result = [];
    for (let i = min; i <= max; i += interval) {
      result.push({ value: i, label: `${i}` });
    }

    // to ensure the final year is visible as a label
    if (result[result.length - 1].value !== max) {
      result.push({ value: max, label: `${max}` });
    }
    return result;
  }, [min, max]);

  return (
    <Stack
      direction="row"
      spacing={isMobile ? 1 : 3}
      alignItems="center"
      sx={{ width: "100%" }}
    >
      <Tooltip title={isPlaying ? "Pause" : "Play Time-lapse"}>
        <IconButton
          onClick={() => (isPlaying ? stopAnimation() : startAnimation())}
          color="primary"
          sx={{ border: "1px solid", borderColor: "primary.main" }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
      </Tooltip>

      <Box sx={{ flexGrow: 1, px: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: "bold",
              color: "primary.main",
              textTransform: "uppercase",
            }}
          >
            Timeline
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontFamily: "monospace", fontWeight: "bold" }}
          >
            {range[0] === range[1] ? range[0] : `${range[0]} — ${range[1]}`}
          </Typography>
        </Box>

        <Slider
          value={range}
          min={min}
          max={max}
          step={1}
          marks={marks} // <--- ADDED MARKS HERE
          valueLabelDisplay="auto"
          onChange={(_e, val) => {
            stopAnimation();
            onTimeChange(val as TimeRange);
          }}
          onChangeCommitted={(_e, val) =>
            onTimeChangeCommitted(val as TimeRange)
          }
          sx={{
            height: 6,
            // Custom styling for the ticks/labels
            "& .MuiSlider-markLabel": {
              fontSize: "0.75rem",
              opacity: 0.6,
              top: "30px", // Move labels further down
            },
            "& .MuiSlider-mark": {
              backgroundColor: "primary.main",
              height: "4px",
              width: "1px",
            },
            "& .MuiSlider-track": { border: "none" },
            "& .MuiSlider-thumb": {
              height: 18,
              width: 18,
              backgroundColor: "#fff",
              border: "2px solid currentColor",
            },
          }}
        />
      </Box>

      <Tooltip title="Reset to Full Range">
        <IconButton
          size="small"
          onClick={() => {
            stopAnimation();
            onTimeChangeCommitted([min, max]);
          }}
          sx={{ opacity: 0.5 }}
        >
          <ReplayIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

export default TimelineControl;
