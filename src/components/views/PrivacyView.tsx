import { Box, Container, Typography, Button, Paper } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppState } from "../../state/appContext";

export default function PrivacyView() {
  const { dispatch } = useAppState();

  return (
    <Box
      sx={{ height: "100%", overflowY: "auto", bgcolor: "background.default" }}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => dispatch({ type: "SET_VIEW", payload: "dashboard" })}
          sx={{ mb: 3 }}
        >
          Back to Dashboard
        </Button>

        <Paper sx={{ p: 4, bgcolor: "background.paper" }}>
          <Typography variant="h4" gutterBottom color="secondary">
            Privacy Protection
          </Typography>
          <Typography variant="body1" paragraph>
            {/* Add your privacy policy here */}
            Information regarding data processing...
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
