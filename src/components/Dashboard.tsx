import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
  Fade,
} from "@mui/material";
import { useAppState } from "../state/appContext";
import { mapTheme } from "../config/mapTheme";
import { ThemeProvider } from "@mui/material/styles";
import { LoadingBar } from "./LoadingBar";

function Dashboard() {
  const { state, dispatch } = useAppState();
  const { loadingProgress, geoJsonData } = state;

  const isLoaded = loadingProgress === 100 && geoJsonData !== null;

  return (
    <ThemeProvider theme={mapTheme}>
      <Typography variant="h2" component="h1" gutterBottom textAlign="center">
        WEBSITE TITLE
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid>
          <Card sx={{ maxWidth: 345 }}>
            <CardContent>
              <img
                src="assets/img-map.jpg"
                alt="Image Description"
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "8px",
                  marginBottom: "16px", // space between image and text
                }}
              />
              <Typography gutterBottom variant="h5" component="div">
                Lorem ipsum dolor sit amet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                diam nonumy eirmod tempor invidunt ut labore et dolore magna
                aliquyam erat, sed diam voluptua. At vero eos et accusam et
                justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
                takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum
                dolor sit amet.
              </Typography>
              {/* CONDITIONAL RENDERING */}
              {!isLoaded ? (
                <LoadingBar progress={loadingProgress} />
              ) : (
                <Fade in={isLoaded}>
                  <Typography
                    variant="body2"
                    color="success.main"
                    fontWeight="bold"
                    textAlign="center"
                    sx={{ mt: 2, mb: 1 }}
                  ></Typography>
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
      </Grid>
    </ThemeProvider>
  );
}

export default Dashboard;
