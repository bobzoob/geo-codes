import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Box,
  Container,
  Typography,
  Fade,
} from "@mui/material";
import { useAppState } from "../state/appContext";
import { LoadingBar } from "./LoadingBar";
import ArticleIcon from "@mui/icons-material/Article";

function Dashboard() {
  const { state, dispatch } = useAppState();
  const { loadingProgress, rawSources } = state;

  const isLoaded =
    loadingProgress === 100 && Object.keys(rawSources).length > 0;

  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "auto",
        bgcolor: "background.default",
      }}
    >
      <Container sx={{ py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom textAlign="center">
          {/* Title goes here */}
        </Typography>

        {/* GRID CONTAINER */}
        <Grid container spacing={4} justifyContent="center">
          {/* Explore Map */}
          <Grid>
            <Card sx={{ maxWidth: 345 }}>
              <CardContent>
                <Typography variant="h6">Explore Map in Live Demo</Typography>
                <Typography variant="subtitle2">
                  Korrespondenzen der Frühromantik
                </Typography>

                <img
                  src="assets/img-map.jpg"
                  alt="Image Description"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    marginTop: "8px",
                  }}
                />

                {/* Quotation block */}
                <Typography
                  component="blockquote"
                  variant="caption"
                  sx={{
                    m: 0,
                    mb: 2,
                    pl: 2,
                    borderLeft: "3px solid",
                    borderColor: "secondary.main",
                    fontStyle: "italic",
                    opacity: 0.9,
                  }}
                >
                  „Der wahre Brief ist, seiner Natur nach, poëtisch.“ (Novalis)
                </Typography>

                {/* Text under quotation */}
                <Typography
                  variant="body2"
                  sx={{ px: 1, textAlign: "justify" }}
                >
                  Doch gibt es den ‚wahren‘ Brief auch in Wirklichkeit? Und wo
                  gilt es zu suchen? In den frühromantischen Fragmenten, in
                  Romanen wie Friedrich Schlegels Roman-Brief Lucinde oder in
                  den alltäglich gewechselten, den ‚authentischen‘ und zu
                  Tausenden überlieferten Briefen?
                </Typography>

                {!isLoaded ? (
                  <LoadingBar progress={loadingProgress} />
                ) : (
                  <Fade in={isLoaded}>
                    <Typography
                      variant="caption"
                      color="success.main"
                      fontWeight="bold"
                      textAlign="center"
                      sx={{ mt: 2, mb: 1 }}
                    >
                      {/* ready text could go here */}
                    </Typography>
                  </Fade>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => dispatch({ type: "SET_VIEW", payload: "map" })}
                  disabled={!isLoaded}
                  sx={{ width: "100%" }}
                >
                  Open Map
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/*Documentation */}
          <Grid>
            <Card
              sx={{
                maxWidth: 345,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6">Project Documentation</Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Developer & User Guide
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    my: 4,
                    color: "text.secondary",
                  }}
                >
                  <ArticleIcon sx={{ fontSize: 280, opacity: 0.5 }} />
                </Box>

                <Typography variant="body2" sx={{ textAlign: "justify" }}>
                  Complete documentation of the technical architecture of this
                  application, including the reactive data pipeline, component
                  structure, and guides for extending the functionality with new
                  layers, filters, or datasets.
                </Typography>
              </CardContent>

              <Box sx={{ p: 2, pt: 0, mt: "auto" }}>
                <CardActions sx={{ p: 0 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      dispatch({ type: "SET_VIEW", payload: "documentation" })
                    }
                    sx={{ width: "100%" }}
                  >
                    View Documentation
                  </Button>
                </CardActions>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Dashboard;
