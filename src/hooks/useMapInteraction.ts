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
          type: "SET_HIGHLIGHTED_FEATURES",
          payload: [
            { id: String(feature.id || feature.properties?.id), layerId },
          ],
        });

        // This dispatch must be INSIDE the if block!
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

      // NEW CASE: Dynamic Grouping (e.g., grouping letters by topic or thread)
      const groupingField = config.interactionConfig?.groupingField;
      if (groupingField) {
        let rawGroupValue = feature.properties[groupingField];

        // 1. MapLibre stringification fix (safely parse arrays/objects)
        if (
          typeof rawGroupValue === "string" &&
          (rawGroupValue.startsWith("[") || rawGroupValue.startsWith("{"))
        ) {
          try {
            rawGroupValue = JSON.parse(rawGroupValue);
          } catch (e) {}
        }

        if (
          rawGroupValue !== undefined &&
          rawGroupValue !== null &&
          rawGroupValue !== ""
        ) {
          // 2. Normalize to an array so we can easily compare single strings OR arrays
          const groupValuesArray = Array.isArray(rawGroupValue)
            ? rawGroupValue
            : [rawGroupValue];

          // 3. Find all features in this layer that share ANY value in this array
          const allFeatures = state.processedData[layerId]?.features || [];
          const groupedFeatures = allFeatures.filter((f: any) => {
            let fVal = f.properties[groupingField];

            // Parse the target feature's value as well
            if (
              typeof fVal === "string" &&
              (fVal.startsWith("[") || fVal.startsWith("{"))
            ) {
              try {
                fVal = JSON.parse(fVal);
              } catch (e) {}
            }

            if (fVal === undefined || fVal === null || fVal === "")
              return false;

            const fValArray = Array.isArray(fVal) ? fVal : [fVal];

            // Check for intersection: Does fValArray share any elements with groupValuesArray?
            return fValArray.some((v: any) => groupValuesArray.includes(v));
          });

          if (groupedFeatures.length > 1) {
            // 4. Highlight all of them on the map
            const highlights = groupedFeatures.map((f: any) => ({
              id: String(f.id || f.properties?.id),
              layerId,
            }));
            dispatch({ type: "SET_HIGHLIGHTED_FEATURES", payload: highlights });

            // 5. Mock a parent feature to trick the generic drill-down table!
            const displayTitle = groupValuesArray.join(", ");
            const mockParent = {
              id: `group-${displayTitle}`,
              properties: {
                ...feature.properties,
                title: `Group: ${displayTitle}`, // Fallback title
                [childKey]: groupedFeatures, // Inject the grouped features as children
              },
            };

            dispatch({
              type: "SET_LAYER_DRILL_DOWN",
              payload: { layerId, parentFeature: mockParent },
            });
            dispatch({ type: "SELECT_FEATURE", payload: null });
            return; // Stop execution here
          }
        }
      }

      // CASE: Drill-down (e.g. City Hubs)
      else if (clickAction === "table" && hasChildren) {
        dispatch({
          type: "SET_HIGHLIGHTED_FEATURES",
          payload: [
            { id: String(feature.id || feature.properties?.id), layerId },
          ],
        });

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
    [
      state.layerConfig,
      state.selectedLayerId,
      state.sources,
      state.processedData,
      dispatch,
    ]
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
