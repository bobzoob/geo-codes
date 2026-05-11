// src/hooks/useMapInteraction.ts

import { useState, useCallback, useEffect } from "react";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { useAppState } from "../state/appContext";

/**
 * SelectionState represents a feature selected globally (via Click or Table).
 */
export interface SelectionState {
  id: string;
  layerId: string;
  latitude: number;
  longitude: number;
  templateId?: string;
}

/**
 * HoverState represents a feature currently under the mouse.
 */
export interface HoverState {
  id: string;
  layerId: string;
  latitude: number;
  longitude: number;
}

export function useMapInteraction() {
  const { state, dispatch } = useAppState();

  const selectedFeature = state.selectedFeature;
  const [hoverInfo, setHoverInfo] = useState<HoverState | null>(null);

  /**
   * Helper to identify which layer this mapLibre feature belongs to.
   * Strips all common MapLibre layer suffixes to match the LayerConfig ID.
   */
  const getLayerIdFromFeature = (feature: any): string => {
    return feature.source ? feature.source.replace("-source", "") : "";
  };

  /**
   * APP SELECTION LISTENER
   * Listens for custom 'app:select-feature' events.
   * Used when clicking the "Eye" in the Table or an item in a Hub list.
   */
  useEffect(() => {
    const handleAppSelect = (e: any) => {
      const { feature, layerId, templateId, isDrillDown } = e.detail;

      if (!feature || !layerId) return;

      // 1. Determine coordinates for map centering
      let coords = [0, 0];
      if (feature.geometry?.type === "Point") {
        coords = feature.geometry.coordinates;
      } else if (feature.geometry?.type === "LineString") {
        coords = feature.geometry.coordinates[0]; // Center on origin
      }

      // 2. GENERIC DRILL-DOWN:
      if (isDrillDown) {
        dispatch({
          type: "SET_LAYER_DRILL_DOWN",
          payload: { layerId, parentFeature: feature },
        });
      }
      // 3. GENERIC SELECTION:
      else {
        dispatch({
          type: "SELECT_FEATURE",
          payload: {
            id: String(feature.id || feature.properties?.id),
            layerId: layerId,
            templateId: templateId,
            longitude: coords[0],
            latitude: coords[1],
          },
        });
      }
    };

    window.addEventListener("app:select-feature", handleAppSelect);
    return () =>
      window.removeEventListener("app:select-feature", handleAppSelect);
  }, [dispatch]);

  /**
   * CLICK HANDLER
   */
  const onMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];

      if (!feature) {
        dispatch({ type: "SELECT_FEATURE", payload: null });
        // If clicking empty map, clear drill-down for the currently active layer
        if (state.selectedLayerId) {
          dispatch({
            type: "SET_LAYER_DRILL_DOWN",
            payload: { layerId: state.selectedLayerId, parentFeature: null },
          });
        }
        return;
      }

      const layerId = getLayerIdFromFeature(feature);
      const config = state.layerConfig.find((l) => l.id === layerId);
      const source = state.sources[config?.sourceId || ""];

      if (!config || !source) return;

      // GENERIC LOGIC: Check mapping for children and config for click action
      const childKey = source.mapping.children || "children";
      const rawChildren = feature.properties[childKey];
      const hasChildren = rawChildren && rawChildren !== "[]";

      const clickAction = config.interactionConfig?.clickTrigger || "detail";

      // CASE: Drill-down (e.g. City Hubs)
      if (clickAction === "table" && hasChildren) {
        dispatch({
          type: "SET_LAYER_DRILL_DOWN",
          payload: { layerId, parentFeature: feature },
        });
        dispatch({ type: "SELECT_FEATURE", payload: null });
      }
      // CASE: Selection (e.g. Individual Letters/Points)
      else if (config.templateId) {
        dispatch({
          type: "SELECT_FEATURE",
          payload: {
            id: String(feature.id || feature.properties?.id),
            layerId: layerId,
            templateId: undefined,
            longitude: event.lngLat.lng,
            latitude: event.lngLat.lat,
          },
        });
      }
    },
    [state.layerConfig, state.selectedLayerId, state.sources, dispatch]
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

      if (!config || !config.templateId) {
        setHoverInfo(null);
        return;
      }

      setHoverInfo({
        id: String(feature.id || feature.properties?.id),
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
    dispatch({ type: "SELECT_FEATURE", payload: null });
  }, [dispatch]);

  return {
    selectedFeature,
    hoverInfo,
    onMapClick,
    onMapMouseMove,
    onMapMouseLeave,
    closePopup,
  };
}
