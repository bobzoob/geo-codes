import Map, {
  NavigationControl,
  ScaleControl,
  Popup,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { APP_CONFIG } from "../config/appConfig";
import type { ReactNode } from "react";
import { useMapInteraction } from "../hooks/useMapInteraction"; // logic for this component
import { MapPopup } from "./layout/MapPopup";
import { useAppState } from "../state/appContext";

import { layerRegistry } from "../layers/layerRegistry";

import { Paper, Typography } from "@mui/material";

interface MapWrapperProps {
  children: ReactNode;
}

function MapWrapper({ children }: MapWrapperProps) {
  const { state } = useAppState();
  const {
    selectedFeature,
    hoverInfo,
    onMapClick,
    closePopup,
    onMapMouseMove,
    onMapMouseLeave,
  } = useMapInteraction();

  // dynamic calculation of layer Ids
  const interactiveLayerIds = state.layerConfig
    .filter((layer) => layer.visible)
    .flatMap((layer) => {
      const plugin = layerRegistry[layer.type];
      if (!plugin) return [];
      return plugin.getInteractiveIds(layer.id);
    });

  // HELPER: extract Title and Subtitle from the generic fields of tooltp
  const getTooltipContent = () => {
    if (!hoverInfo) return { title: "", subtitle: null };

    const fields = hoverInfo.data.fields;

    // Header (FROM TO)
    const titleField = fields.find((f) => f.type === "header");
    const title = titleField ? titleField.value : "Unknown";

    // Subtitle (Date)
    const dateField = fields.find((f) => f.type === "text");
    const subtitle = dateField ? dateField.value : null;

    return { title, subtitle };
  };

  const tooltipContent = getTooltipContent();

  return (
    <Map
      initialViewState={{
        longitude: APP_CONFIG.map.defaultCenter[1],
        latitude: APP_CONFIG.map.defaultCenter[0],
        zoom: APP_CONFIG.map.defaultZoom,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      reuseMaps={true}
      // INTERACTION EVENTS
      onClick={onMapClick}
      onMouseMove={onMapMouseMove}
      onMouseLeave={onMapMouseLeave}
      interactiveLayerIds={interactiveLayerIds}
      // cursor style
      cursor={hoverInfo ? "pointer" : "grab"}
    >
      <ScaleControl position="bottom-left" />
      <NavigationControl position="top-right" showCompass={true} />

      {children}

      {/* POPUP */}
      {selectedFeature && (
        <MapPopup feature={selectedFeature} onClose={closePopup} />
      )}

      {/* TOOLTIP (hover) */}
      {hoverInfo && (
        <Popup
          longitude={hoverInfo.longitude}
          latitude={hoverInfo.latitude}
          offset={[0, -10]}
          closeButton={false}
          closeOnClick={false}
          anchor="bottom"
          className="map-tooltip"
          maxWidth="300px"
          style={{ pointerEvents: "none", zIndex: 200 }} // on top!
        >
          <Paper
            elevation={4}
            sx={{
              p: 1,
              backgroundColor: "rgba(30, 30, 30, 0.9)", // dark background
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              minWidth: "150px",
            }}
          >
            <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
              {tooltipContent.title}
            </Typography>

            {tooltipContent.subtitle && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {tooltipContent.subtitle}
              </Typography>
            )}
          </Paper>
        </Popup>
      )}
    </Map>
  );
}

export default MapWrapper;
