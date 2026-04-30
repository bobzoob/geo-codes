import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Button,
  useMediaQuery,
  type Theme,
} from "@mui/material";
import type { ReactNode } from "react";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import MenuIcon from "@mui/icons-material/Menu";

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
  onToggle,
  maxWidth,
  label,
}: CollapsiblePanelProps) {
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "flex-start",
        height: "100%", // Take full height of the "Panel Zone"
        pointerEvents: "none",
        flexShrink: 0, // Prevent panels from squishing each other
      }}
    >
      <Collapse
        in={!isCollapsed}
        orientation="horizontal"
        sx={{ height: "100%" }} // Force collapse wrapper to fill height
      >
        <Paper
          elevation={4}
          sx={{
            width: isMobile ? `calc(100vw - 110px)` : `${maxWidth}px`,
            minWidth: isMobile ? "200px" : "280px",
            height: "100%", // Fill the Panel Zone
            display: "flex", // Turn into a flex container
            flexDirection: "column",
            overflow: "hidden", // Prevent the Paper itself from scrolling
            pointerEvents: "auto",
            borderRadius: 1,
            bgcolor: "background.paper",
          }}
        >
          {/* 
             This is the magic part: 
             The children (LayerPanel, FeatureTable, etc.) 
             will live inside this flex-grow box.
          */}
          <Box
            sx={{
              flexGrow: 1,
              minHeight: 0, // Crucial for flex-scroll to work in Chrome/Safari
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            {children}
          </Box>
        </Paper>
      </Collapse>

      {/* Toggle Button - Stays outside the scroll area */}
      <Box
        sx={{
          zIndex: 1,
          marginTop: "8px",
          marginLeft: isCollapsed ? "0px" : isMobile ? "4px" : "-12px",
          pointerEvents: "auto",
        }}
      >
        {isCollapsed ? (
          <Button
            variant="contained"
            onClick={onToggle}
            startIcon={<MenuIcon />}
          >
            {isMobile ? "" : label}
          </Button>
        ) : (
          <IconButton
            onClick={onToggle}
            size="small"
            sx={{ bgcolor: "background.paper", boxShadow: 2 }}
          >
            <KeyboardArrowLeftIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

export default CollapsiblePanel;
