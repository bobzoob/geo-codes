import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { useAppState } from "../state/appContext";

interface DashboardProps {
  isDataLoaded: boolean;
}

function Dashboard({ isDataLoaded }: DashboardProps) {
  const { dispatch } = useAppState();

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom textAlign="center">
        Geo Perspektiven
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid>
          <Card sx={{ maxWidth: 345 }}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Hans Kelsen
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Project description, can be a little bit longer maybe this
                long...
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="contained"
                onClick={() => dispatch({ type: "SET_VIEW", payload: "map" })}
                disabled={!isDataLoaded}
              >
                {isDataLoaded ? "Go" : "Loading..."}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
