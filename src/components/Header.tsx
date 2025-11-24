import { Box, Button, Stack } from "@mui/material";
import { useAppState } from "../state/appContext";

function Header() {
  const { state, dispatch } = useAppState();
  return (
    <Box
      component="header"
      sx={{
        backgroundColor: "primary.dark",
        paddingY: 2,
        display: "flex",
        //justifyContent: "space-around",
        alignItems: "center",
        boxShadow: 2,
        zIndex: 1100, // above everything
        position: "relative",
        height: "64px",
      }}
    >
      {/* inner wrapper */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        maxWidth="xl" // limits width on large screens
        //margin="0 auto"
        sx={{ width: "100%", paddingX: 3, paddingY: 2 }}
      ></Stack>

      <Box>
        {/* show the Home button if we are NOT on the dashboard */}
        {state.currentView === "map" && (
          <Button
            variant="outlined"
            color="inherit" // inherits white color from parent
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
      <Box
        component="img"
        src="/logo.png"
        alt="Project Logo"
        sx={{
          height: "40px", //  to fit header
          width: "auto",
          objectFit: "contain",
          // Optional: Add a subtle hover effect
          transition: "opacity 0.2s",
          "&:hover": { opacity: 0.8 },
        }}
      />
    </Box>
  );
}

export default Header;
