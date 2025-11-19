import { Box, Collapse, IconButton, Paper, Stack } from "@mui/material";
import { useAppState } from "../state/appContext";
import TimelineControl from "./TimelineControl";
import OptionsPanel from "./OptionsPanel";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import type { TimeRange } from "../types/state";

function BottomPanel() {
  const { state, dispatch } = useAppState();
  const { liveTimeRange, isBottomPanelCollapsed } = state;

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={4}
        sx={{ width: "calc(100% - 40px)", marginBottom: "20px" }}
      >
        <Box sx={{ textAlign: "center" }}>
          <IconButton
            onClick={() => dispatch({ type: "TOGGLE_BOTTOM_PANEL" })}
            size="small"
          >
            {isBottomPanelCollapsed ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </Box>
        <Collapse in={!isBottomPanelCollapsed}>
          <Stack>
            <TimelineControl
              range={liveTimeRange}
              onTimeChange={(newRange: TimeRange) =>
                dispatch({ type: "SET_LIVE_TIME_RANGE", payload: newRange })
              }
              onTimeChangeCommitted={(newRange: TimeRange) =>
                dispatch({
                  type: "SET_COMMITTED_TIME_RANGE",
                  payload: newRange,
                })
              }
            />
            <OptionsPanel />
          </Stack>
        </Collapse>
      </Paper>
    </Box>
  );
}

export default BottomPanel;
