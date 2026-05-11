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
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        height: "100%",
        pointerEvents: "none",
        flexShrink: 0,
      }}
    >
      <Collapse
        in={!isCollapsed}
        orientation="horizontal"
        sx={{ height: "100%" }}
      >
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
      </Collapse>
    </Box>
  );
}

export default CollapsiblePanel;
