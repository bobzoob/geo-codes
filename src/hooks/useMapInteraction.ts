import { useState, useCallback, useEffect } from "react";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { useAppState } from "../state/appContext";

export interface SelectedFeature {
  featureId: string;
  layerId: string;
  latitude: number;
  longitude: number;
}

export interface PopupInfo {
  featureId: string;
  layerId: string;
  latitude: number;
  longitude: number;
}

export function useMapInteraction() {
  const { state } = useAppState();
  const [selectedFeature, setSelectedFeature] =
    useState<SelectedFeature | null>(null);
  const [hoverInfo, setHoverInfo] = useState<PopupInfo | null>(null);

  /**
   * Helper to identify which layer this mapLibre feature belongs to
   */
  const getLayerIdFromFeature = (feature: any): string => {
    // MapLibre sources are often named "layerId-source"
    return feature.source.replace("-source", "");
  };

  /**
   * Listen for "drill-down" clicks from the list inside a popup
   */
  useEffect(() => {
    const handleDrillDown = (e: any) => {
      const { feature, layerId } = e.detail;

      if (!feature) return;

      // DEBUG: Check if the feature actually has an ID and what the target layer is
      console.log("Drill-down triggered:", {
        id: feature.id,
        targetLayer: layerId,
        properties: feature.properties,
      });

      setSelectedFeature((prev) => {
        // 1. Determine fallback coordinates if prev is null
        let fallbackCoords = [0, 0];
        if (feature.geometry?.type === "Point") {
          fallbackCoords = feature.geometry.coordinates;
        } else if (feature.geometry?.type === "LineString") {
          // Use the start of the line (Origin)
          fallbackCoords = feature.geometry.coordinates[0];
        }

        return {
          // Ensure we use the ID that the selector sanitized
          featureId: String(feature.id || feature.properties?.id),
          layerId: layerId,
          // Priority: 1. Current popup position, 2. Feature's own position
          longitude: prev?.longitude ?? fallbackCoords[0],
          latitude: prev?.latitude ?? fallbackCoords[1],
        };
      });
    };

    window.addEventListener("app:select-feature", handleDrillDown);
    return () =>
      window.removeEventListener("app:select-feature", handleDrillDown);
  }, []);
  /**
   * CLICK HANDLER
   */
  const onMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];

      if (!feature) {
        setSelectedFeature(null);
        return;
      }

      const layerId = getLayerIdFromFeature(feature);
      const config = state.layerConfig.find((l) => l.id === layerId);

      // Only select if the layer is configured to have a popup
      if (!config || !config.popupConfig) return;

      setSelectedFeature({
        featureId: feature.id as string,
        layerId: layerId,
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
      });
    },
    [state.layerConfig]
  );

  /**
   * HOVER HANDLER
   */
  const onMapMouseMove = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];

      if (!feature) {
        setHoverInfo(null);
        return;
      }

      const layerId = getLayerIdFromFeature(feature);
      const config = state.layerConfig.find((l) => l.id === layerId);

      // Only show tooltip if the layer has a popupConfig defined
      if (!config || !config.popupConfig) {
        setHoverInfo(null);
        return;
      }

      setHoverInfo({
        featureId: feature.id as string,
        layerId: layerId,
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
      });
    },
    [state.layerConfig]
  );

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
