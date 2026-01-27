import { Box, ButtonBase, Stack } from "@mui/material";
import { useAppState } from "../../state/appContext";

function Header() {
  const { dispatch } = useAppState();

  return (
    <Box
      component="header"
      sx={{
        backgroundColor: "primary.dark",
        paddingY: 2,
        paddingX: 3,
        zIndex: 1100,
        boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.2)",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        maxWidth="xl"
        margin="0 auto"
      >
        {/* Left side: intentionally empty  */}
        <Box />

        {/* Right side: Logo as Home button */}
        <ButtonBase
          onClick={() => dispatch({ type: "SET_VIEW", payload: "dashboard" })}
          aria-label="Go to dashboard"
          sx={{
            borderRadius: 1,
            p: 0.5,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.08)",
            },
          }}
        >
          <Box
            component="img"
            src="assets/logo.png"
            alt="Project Logo"
            sx={{
              height: "40px",
              width: "auto",
              objectFit: "contain",
            }}
          />
        </ButtonBase>
      </Stack>
    </Box>
  );
}

export default Header;
