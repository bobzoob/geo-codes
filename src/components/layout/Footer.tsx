import { Box, Button, Stack, Typography } from "@mui/material";
import { useAppState } from "../../state/appContext";

export default function Footer() {
  const { dispatch } = useAppState();

  const linkStyle = {
    fontSize: "0.8rem",
    color: "text.secondary",
    textTransform: "none",
    "&:hover": {
      color: "secondary.main",
      bgcolor: "transparent",
    },
    minWidth: 0,
  };

  return (
    <Box
      sx={{
        p: 1,
        px: 25,
        bgcolor: "background.paper",
        borderTop: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        alignItems="center"
      >
        <Button
          sx={linkStyle}
          onClick={() => dispatch({ type: "SET_VIEW", payload: "license" })}
        >
          License
        </Button>

        <Typography variant="caption" sx={{ opacity: 0.3 }}>
          |
        </Typography>

        <Button
          sx={linkStyle}
          onClick={() => dispatch({ type: "SET_VIEW", payload: "privacy" })}
        >
          Privacy Protection
        </Button>
      </Stack>
    </Box>
  );
}
