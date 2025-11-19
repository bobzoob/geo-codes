import { Box, Collapse, IconButton, Paper } from "@mui/material";
import type { ReactNode } from "react";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

interface CollapsiblePanelProps {
  children: ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  width: number; // width panel when opend
}

function CollapsiblePanel({
  children,
  isCollapsed,
  onToggle,
  width,
}: CollapsiblePanelProps) {
  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <Collapse in={!isCollapsed} orientation="horizontal">
        <Paper
          elevation={4}
          sx={{
            width: `${width}px`,
            height: "100%",
            overflowY: "auto",
            backgroundColor: "transparent",
          }}
        >
          {children}
        </Paper>
      </Collapse>

      {/* toggle button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{
            backgroundColor: "background.paper",
            "&:hover": { backgroundColor: "action.hover" },
            boxShadow: 1,
          }}
        >
          {isCollapsed ? <KeyboardArrowRightIcon /> : <KeyboardArrowLeftIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}

export default CollapsiblePanel;
