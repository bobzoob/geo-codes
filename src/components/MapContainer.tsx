import { Box } from "@mui/material";
import MapWrapper from "./MapWrapper";
import LayerManager from "./LayerManager";

/**
 * core map canvas- single responsibility:
 * render map tiles and data layers (polygons, points, lines, ..)
 */
function MapContainer() {
  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <MapWrapper>
        {/* LayerManager retrieves config, data, time from AppState internally */}
        <LayerManager />
      </MapWrapper>
    </Box>
  );
}

export default MapContainer;
