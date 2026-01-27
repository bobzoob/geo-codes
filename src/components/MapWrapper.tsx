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
import { extractGenericPopupData } from "../utils/popupUtils";
import { Paper, Typography } from "@mui/material";

interface MapWrapperProps {
  children: ReactNode;
}

function MapWrapper({ children }: MapWrapperProps) {
  const { state } = useAppState();
  const { processedData, layerConfig, entities } = state;
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

  // LIVE TOOLTIP
  const getTooltipContent = () => {
    if (!hoverInfo) return { title: "", subtitle: null };

    // find feature
    const layerData = processedData[hoverInfo.layerId];
    const feature = layerData?.features.find(
      (f: any) => String(f.id) === String(hoverInfo.featureId)
    );

    // DEBUG LOG
    console.log("Hovered Layer:", hoverInfo.layerId, "Found Feature:", feature);

    if (!feature)
      return { title: `Not found: ${hoverInfo.featureId}`, subtitle: null };
    // getconfig for this layer
    const config = layerConfig.find((l) => l.id === hoverInfo.layerId);
    if (!config) return { title: "Unknown", subtitle: null };

    // ectract display data
    const popupData = extractGenericPopupData(
      feature,
      config.popupConfig,
      entities
    );

    const titleField = popupData.fields.find((f) => f.type === "header");
    const subtitleField = popupData.fields.find((f) => f.type === "text");

    return {
      title: titleField ? titleField.value : "Unknown",
      subtitle: subtitleField ? subtitleField.value : null,
    };
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
      onClick={onMapClick}
      onMouseMove={onMapMouseMove}
      onMouseLeave={onMapMouseLeave}
      interactiveLayerIds={interactiveLayerIds}
      cursor={hoverInfo ? "pointer" : "grab"}
    >
      <ScaleControl position="bottom-left" />
      <NavigationControl position="top-right" showCompass={true} />

      {children}

      {/* POPUP (Click) */}
      {selectedFeature && (
        <MapPopup feature={selectedFeature} onClose={closePopup} />
      )}

      {/* TOOLTIP (Hover) */}
      {hoverInfo && (
        <Popup
          longitude={hoverInfo.longitude}
          latitude={hoverInfo.latitude}
          offset={[0, -10]}
          closeButton={false}
          closeOnClick={false}
          anchor="bottom"
          style={{ pointerEvents: "none", zIndex: 200 }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 1,
              backgroundColor: "rgba(30, 30, 30, 0.9)",
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
