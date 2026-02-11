import Map, {
  NavigationControl,
  ScaleControl,
  Popup,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { popupTemplates } from "../config/templates";
import type { ReactNode } from "react";
import { useMapInteraction } from "../hooks/useMapInteraction"; // logic for this component
import { MapPopup } from "./layout/MapPopup";
import { useAppState } from "../state/appContext";
import { layerRegistry } from "../layers/layerRegistry";
import { extractGenericPopupData } from "../utils/popupUtils";
import { Paper, Typography } from "@mui/material";
import { MapHighlighter } from "../components/MapHighlighter"; // highlight selected

interface MapWrapperProps {
  children: ReactNode;
}

function MapWrapper({ children }: MapWrapperProps) {
  const { state } = useAppState();
  const { processedData, layerConfig, dictionaries, sources, settings } = state;
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
      return plugin ? plugin.getInteractiveIds(layer.id) : [];
    });

  // LIVE TOOLTIP
  const getTooltipContent = () => {
    if (!hoverInfo) return { title: "", subtitle: null };

    // find feature
    const layerData = processedData[hoverInfo.layerId];
    const feature = layerData?.features.find(
      (f: any) => String(f.id) === String(hoverInfo.featureId)
    );

    if (!feature)
      return { title: `Not found: ${hoverInfo.featureId}`, subtitle: null };

    // layer and source config
    const layer = layerConfig.find((l) => l.id === hoverInfo.layerId);
    if (!layer) return { title: "Unknown Layer", subtitle: null };

    const sourceConfig = sources[layer.sourceId];
    const template = popupTemplates[layer.templateId];

    if (!template) return { title: layer.name, subtitle: null };

    // resolve correct dictionary for hovered layer
    const dictionaryId = layer.dictionaryId || sourceConfig?.dictionaryId;

    // console.log("DEBUG: Tooltip Lookup", {
    //   lookingFor: dictionaryId,
    //   availableDictionaries: Object.keys(dictionaries),
    //   foundData: dictionaries[dictionaryId || ""],
    // });

    const relevantDictionary = dictionaryId ? dictionaries[dictionaryId] : {};

    // ectract display data
    const popupData = extractGenericPopupData(
      feature,
      template,
      relevantDictionary
    );

    // we try to find standart header
    let titleField = popupData.fields.find((f) => f.type === "header");
    let displayTitle = titleField?.value;

    // but if we dont find it we check is the first field is correspondance header (custom)
    if (!displayTitle) {
      const firstField = popupData.fields[0];
      if (
        firstField?.type === "custom" &&
        firstField.componentId === "CorrespondenceHeader"
      ) {
        // we manually resolve names for tooltip string
        const resolve = (ids: any) => {
          const idList = Array.isArray(ids) ? ids : [ids];
          return idList
            .map((id) => relevantDictionary[id]?.name || id)
            .join(", ");
        };

        const senders = resolve(feature.properties.sender_ids);
        const recipients = resolve(feature.properties.recipient_ids);
        displayTitle = `${senders} → ${recipients}`;
      }
    }

    // Fallbacks
    if (!displayTitle) {
      displayTitle =
        feature.properties.title || feature.properties.name || layer.name;
    }

    const subtitleField = popupData.fields.find((f) => f.type === "text");

    return {
      title: displayTitle,
      subtitle: subtitleField ? subtitleField.value : null,
    };
  };
  const tooltipContent = getTooltipContent();
  return (
    <Map
      initialViewState={{
        longitude: settings.map.defaultCenter[1],
        latitude: settings.map.defaultCenter[0],
        zoom: settings.map.defaultZoom,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={settings.map.style}
      reuseMaps={true}
      onClick={onMapClick}
      onMouseMove={onMapMouseMove}
      onMouseLeave={onMapMouseLeave}
      interactiveLayerIds={interactiveLayerIds}
      cursor={hoverInfo ? "pointer" : "grab"}
    >
      <ScaleControl position="bottom-left" />
      <NavigationControl position="top-right" showCompass={true} />

      <MapHighlighter />

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
