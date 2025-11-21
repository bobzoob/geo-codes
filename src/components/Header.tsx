import { Box, Button } from "@mui/material";
import { useAppState } from "../state/appContext";

function Header() {
  const { state, dispatch } = useAppState();
  return (
    <Box
      sx={{
        backgroundColor: "primary.dark",
        paddingX: 3,
        paddingY: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: 2,
        zIndex: 1100, // Ensure it sits above map elements if they overlap
        position: "relative",
      }}
    >
      {/* Only show the Home button if we are NOT on the dashboard */}
      {state.currentView === "map" && (
        <Button
          variant="outlined"
          color="inherit" // Inherits white color from parent
          size="small"
          onClick={() => dispatch({ type: "SET_VIEW", payload: "dashboard" })}
          sx={{
            color: "white",
            borderColor: "rgba(255,255,255,0.5)",
            "&:hover": {
              borderColor: "white",
              backgroundColor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          Home
        </Button>
      )}
    </Box>
  );
}

export default Header;
