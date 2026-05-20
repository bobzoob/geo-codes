import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppState } from "../../state/appContext";

interface StaticContentViewProps {
  title: string;
  children: React.ReactNode;
}

export function StaticContentView({ title, children }: StaticContentViewProps) {
  const { dispatch } = useAppState();

  return (
    <Box
      sx={{
        height: "100dvh",
        width: "100vw",
        bgcolor: "background.default",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          paddingY: 2,
          paddingX: 3,
          bgcolor: "background.paper",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {/* inner Stack matches the main Header alignment and max-width */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          maxWidth="xl"
          margin="0 auto"
        >
          <Typography variant="h6" color="secondary">
            {title}
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => dispatch({ type: "SET_VIEW", payload: "dashboard" })}
            variant="outlined"
            color="primary"
            size="small"
          >
            Back to Dashboard
          </Button>
        </Stack>
      </Box>

      {/* CONTENT */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper elevation={0} sx={{ p: 4, bgcolor: "transparent" }}>
          {children}
        </Paper>
      </Container>
    </Box>
  );
}
