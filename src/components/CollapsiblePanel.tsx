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

/**
 * reusable component for a "floating" panel that can be collapsed or expanded
 */
interface CollapsiblePanelProps {
  children: ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  width: number; // width panel when opend
  label: string;
}

function CollapsiblePanel({
  children,
  isCollapsed,
  onToggle,
  width,
  label,
}: CollapsiblePanelProps) {
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", height: "100%" }}>
      {/* Content Area */}
      <Collapse in={!isCollapsed} orientation="horizontal">
        <Paper
          elevation={4}
          sx={{
            width: `${width}px`,
            height: "100%",
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
            <IconButton
              onClick={onToggle}
              sx={{
                boxShadow: 3,
              }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            // desktop: full text
            <Button
              variant="contained"
              onClick={onToggle}
              startIcon={<MenuIcon />}
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                boxShadow: 3,
              }}
            >
              {/* here is where the button texxt goes*/}
              {label}
            </Button>
          )
        ) : (
          // second status, when open: arrow
          <IconButton
            onClick={onToggle}
            size="small"
            sx={{
              boxShadow: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <KeyboardArrowLeftIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

export default CollapsiblePanel;
