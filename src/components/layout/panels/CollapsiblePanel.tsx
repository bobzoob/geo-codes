import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Button,
  Tooltip,
  useMediaQuery,
  type Theme,
} from "@mui/material";
import type { ReactNode } from "react";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import MenuIcon from "@mui/icons-material/Menu";

/**
 * reusable component for a "floating" panel that can be collapsed or expanded
 */
interface CollapsiblePanelProps {
  children: ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  maxWidth: number; // width panel when opend
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
        alignItems: "flex-start",
        // height: "auto",
        maxHeight: "100%",
        pointerEvents: "none",
      }}
    >
      {/* Content Area */}
      <Collapse in={!isCollapsed} orientation="horizontal">
        <Paper
          elevation={4}
          sx={{
            width: "fit-content",
            minWidth: "280px",
            maxWidth: isMobile ? "calc(100vw - 80px)" : `${maxWidth}px`,

            maxHeight: "calc(100vh - 190px)",
            overflowY: "auto",
            pointerEvents: "auto",
            borderRadius: 1,
          }}
        >
          {children}
        </Paper>
      </Collapse>

      {/* toggle button*/}
      <Box
        sx={{
          zIndex: 1,
          marginTop: "8px",
          marginLeft: isCollapsed ? "0px" : "-12px", // slightly to the right
          pointerEvents: "auto",
          transition: "margin 0.3s",
        }}
      >
        {isCollapsed ? (
          isMobile ? (
            // button shrink in mobil
            <Tooltip title={label} placement="bottom" arrow>
              <IconButton onClick={onToggle}>
                <MenuIcon />
              </IconButton>
            </Tooltip>
          ) : (
            // desktop: full text
            <Button
              variant="contained"
              onClick={onToggle}
              startIcon={<MenuIcon />}
            >
              {/* here is where the button texxt goes*/}
              {label}
            </Button>
          )
        ) : (
          // second status, when open: arrow
          <IconButton onClick={onToggle} size="small">
            <KeyboardArrowLeftIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

export default CollapsiblePanel;
