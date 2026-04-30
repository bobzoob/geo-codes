// src/hooks/useMapInteraction.ts

import { useState, useCallback, useEffect } from "react";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { useAppState } from "../state/appContext";

/**
 * SelectionState represents a feature selected globally (via Click or Table).
 * This is stored in the AppReducer.
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
 * This is kept local for performance.
 */
export interface HoverState {
  id: string;
  layerId: string;
  latitude: number;
  longitude: number;
}

export function useMapInteraction() {
  const { state, dispatch } = useAppState();

  // 1. GLOBAL STATE: Persistent selection (for Click and Table sync)
  const selectedFeature = state.selectedFeature;

  // 2. LOCAL STATE: Transient hover (kept local to avoid lagging the whole app)
  const [hoverInfo, setHoverInfo] = useState<HoverState | null>(null);

  /**
   * Helper to identify which layer this mapLibre feature belongs to
   */
  const getLayerIdFromFeature = (feature: any): string => {
    return feature.source.replace("-source", "");
  };

  /**
   * DRILL-DOWN LISTENER
   * Listen for clicks from the list inside a popup (e.g. clicking a letter in a city hub)
   */
  useEffect(() => {
    const handleDrillDown = (e: any) => {
      // We expect 'isDrillDown' to be passed if we want the table to enter the hub
      const { feature, parentFeature, templateId, layerId, isDrillDown } =
        e.detail;
      if (!feature) return;

      // 1. If a parent was passed, tell the Table to drill down to that Hub
      if (parentFeature) {
        dispatch({ type: "SET_DRILL_DOWN", payload: parentFeature });
        dispatch({ type: "SET_TABLE_LOADED", payload: true });

        // Optional: Open the table panel if it's closed
        if (state.isTablePanelCollapsed) {
          dispatch({ type: "TOGGLE_TABLE_PANEL" });
        }
      }

      // 1. Determine coordinates for map positioning
      let coords = [0, 0];
      if (feature.geometry?.type === "Point") {
        coords = feature.geometry.coordinates;
      } else if (feature.geometry?.type === "LineString") {
        coords = feature.geometry.coordinates[0]; // Use start of line (Origin)
      }

      // 2. Handle Table Logic
      if (isDrillDown) {
        // Set the table to show this feature's children
        dispatch({ type: "SET_DRILL_DOWN", payload: feature });

        // Ensure the table is "Loaded" so the user doesn't see the placeholder
        dispatch({ type: "SET_TABLE_LOADED", payload: true });

        // UX: If the table panel is currently closed, open it automatically
        if (state.isTablePanelCollapsed) {
          dispatch({ type: "TOGGLE_TABLE_PANEL" });
        }
      }
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
    };

    window.addEventListener("app:select-feature", handleDrillDown);
    return () =>
      window.removeEventListener("app:select-feature", handleDrillDown);
  }, [dispatch]);

  /**
   * CLICK HANDLER
   * Updates the global state so the Table and Map both react.
   */
  const onMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];

      if (!feature) {
        dispatch({ type: "SELECT_FEATURE", payload: null });
        return;
      }

      const layerId = getLayerIdFromFeature(feature);
      const config = state.layerConfig.find((l) => l.id === layerId);

      if (!config || !config.templateId) return;

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
    },
    [state.layerConfig, dispatch]
  );

  /**
   * HOVER HANDLER
   * Updates local state only.
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
    selectedFeature, // Global (Persistent)
    hoverInfo, // Local (Transient)
    onMapClick,
    onMapMouseMove,
    onMapMouseLeave,
    closePopup,
  };
}
// import { useState, useCallback, useEffect } from "react";
// import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
// import { useAppState } from "../state/appContext";

// export interface SelectedFeature {
//   featureId: string;
//   layerId: string;
//   latitude: number;
//   longitude: number;
//   templateId?: string;
// }

// export interface PopupInfo {
//   featureId: string;
//   layerId: string;
//   latitude: number;
//   longitude: number;
// }

// export function useMapInteraction() {
//   const { state } = useAppState();
//   const [selectedFeature, setSelectedFeature] =
//     useState<SelectedFeature | null>(null);
//   const [hoverInfo, setHoverInfo] = useState<PopupInfo | null>(null);

//   /**
//    * Helper to identify which layer this mapLibre feature belongs to
//    */
//   const getLayerIdFromFeature = (feature: any): string => {
//     // MapLibre sources are often named "layerId-source"
//     return feature.source.replace("-source", "");
//   };

//   /**
//    * Listen for "drill-down" clicks from the list inside a popup
//    */
//   useEffect(() => {
//     const handleDrillDown = (e: any) => {
//       const { feature, templateId, layerId } = e.detail;

//       if (!feature) return;

//       setSelectedFeature((prev) => {
//         // fallback coordinates if prev is null
//         let fallbackCoords = [0, 0];
//         if (feature.geometry?.type === "Point") {
//           fallbackCoords = feature.geometry.coordinates;
//         } else if (feature.geometry?.type === "LineString") {
//           // use the start of the line (Origin)
//           fallbackCoords = feature.geometry.coordinates[0];
//         }

//         return {
//           // we use the ID that the selector sanitized
//           featureId: String(feature.id || feature.properties?.id),
//           layerId: layerId,
//           templateId: templateId,
//           // priority: curret popup position, after: featurs own position
//           longitude: prev?.longitude ?? fallbackCoords[0],
//           latitude: prev?.latitude ?? fallbackCoords[1],
//         };
//       });
//     };

//     window.addEventListener("app:select-feature", handleDrillDown);
//     return () =>
//       window.removeEventListener("app:select-feature", handleDrillDown);
//   }, []);
//   /**
//    * CLICK HANDLER
//    */
//   const onMapClick = useCallback(
//     (event: MapLayerMouseEvent) => {
//       const feature = event.features?.[0];

//       if (!feature) {
//         setSelectedFeature(null);
//         return;
//       }

//       const layerId = getLayerIdFromFeature(feature);
//       const config = state.layerConfig.find((l) => l.id === layerId);

//       // select if the layer is configured to have a popup
//       if (!config || !config.templateId) return;

//       setSelectedFeature({
//         featureId: feature.id as string,
//         layerId: layerId,
//         templateId: undefined, // reset to default
//         longitude: event.lngLat.lng,
//         latitude: event.lngLat.lat,
//       });
//     },
//     [state.layerConfig]
//   );

//   /**
//    * HOVER HANDLER
//    */
//   const onMapMouseMove = useCallback(
//     (event: MapLayerMouseEvent) => {
//       const feature = event.features?.[0];

//       if (!feature) {
//         setHoverInfo(null);
//         return;
//       }

//       const layerId = getLayerIdFromFeature(feature);
//       const config = state.layerConfig.find((l) => l.id === layerId);

//       // show tooltip if the layer has a popupConfig defined
//       if (!config || !config.templateId) {
//         setHoverInfo(null);
//         return;
//       }

//       setHoverInfo({
//         featureId: feature.id as string,
//         layerId: layerId,
//         longitude: event.lngLat.lng,
//         latitude: event.lngLat.lat,
//       });
//     },
//     [state.layerConfig]
//   );

//   const onMapMouseLeave = useCallback(() => {
//     setHoverInfo(null);
//   }, []);

//   const closePopup = useCallback(() => {
//     setSelectedFeature(null);
//   }, []);

//   return {
//     selectedFeature,
//     hoverInfo,
//     onMapClick,
//     onMapMouseMove,
//     onMapMouseLeave,
//     closePopup,
//   };
// }
