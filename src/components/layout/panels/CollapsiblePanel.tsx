import { Box, Collapse, Paper, useMediaQuery, type Theme } from "@mui/material";
import type { ReactNode } from "react";

interface CollapsiblePanelProps {
  children: ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  maxWidth: number;
  label: string;
}

function CollapsiblePanel({
  children,
  isCollapsed,
  maxWidth,
}: CollapsiblePanelProps) {
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  return (
    <Collapse
      in={!isCollapsed}
      orientation="horizontal"
      unmountOnExit // removes panel from DOM when fully closed
      sx={{ height: "100%", flexShrink: 0 }}
    >
      <Box sx={{ height: "100%", pr: "15px", pointerEvents: "none" }}>
        <Paper
          elevation={4}
          sx={{
            width: isMobile ? `calc(100vw - 32px)` : `${maxWidth}px`,
            minWidth: isMobile ? "200px" : "280px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            pointerEvents: "auto",
            borderRadius: 1,
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            {children}
          </Box>
        </Paper>
      </Box>
    </Collapse>
  );
}

export default CollapsiblePanel;
