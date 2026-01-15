import { useState, useCallback } from "react";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { useAppState } from "../state/appContext";
import {
  extractGenericPopupData,
  type GenericPopupData,
} from "../utils/popupUtils";

export interface SelectedFeature {
  latitude: number;
  longitude: number;
  data: GenericPopupData;
}

export interface PopupInfo {
  latitude: number;
  longitude: number;
  data: GenericPopupData;
}

export function useMapInteraction() {
  const { state } = useAppState();
  const [selectedFeature, setSelectedFeature] =
    useState<SelectedFeature | null>(null);

  const [hoverInfo, setHoverInfo] = useState<PopupInfo | null>(null);

  // Helper to find the config for the clicked feature
  const getLayerConfig = (feature: any) => {
    const sourceId = feature.source;
    // check if the source matches the layer ID or the ID + "-source" suffix
    return state.layerConfig.find(
      (l) => l.id === sourceId || `${l.id}-source` === sourceId
    );
  };

  // CLICK HANDLER
  const onMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];

      if (!feature) {
        setSelectedFeature(null);
        return;
      }

      // find which layer this feature belongs to
      const config = getLayerConfig(feature);

      if (!config || !config.popupConfig) {
        console.warn("No popup config found for layer:", feature.source);
        return;
      }

      // here we extract the data using the configuration rules
      const popupData = extractGenericPopupData(
        feature,
        config.popupConfig,
        state.entities
      );

      setSelectedFeature({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        data: popupData,
      });
    },
    [state.layerConfig, state.entities]
  );

  // HOVER HANDLER
  const onMapMouseMove = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];

      if (!feature) {
        setHoverInfo(null);
        return;
      }

      const config = getLayerConfig(feature);

      if (!config || !config.popupConfig) {
        setHoverInfo(null);
        return;
      }

      const popupData = extractGenericPopupData(
        feature,
        config.popupConfig,
        state.entities
      );

      setHoverInfo({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        data: popupData,
      });
    },
    [state.layerConfig, state.entities]
  );

  // MOUSE LEAVE
  const onMapMouseLeave = useCallback(() => {
    setHoverInfo(null);
  }, []);

  const closePopup = useCallback(() => {
    setSelectedFeature(null);
  }, []);

  return {
    selectedFeature,
    hoverInfo,
    onMapClick,
    onMapMouseMove,
    onMapMouseLeave,
    closePopup,
  };
}
