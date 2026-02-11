import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";
import { useMapInteraction } from "../hooks/useMapInteraction";

/**
 * function to render clicked feature as selected
 */

export function MapHighlighter() {
  const { current: map } = useMap();
  const { selectedFeature } = useMapInteraction();

  // we must keep track of previously selected feature to unselect it
  const lastSelectedRef = useRef<{ id: string; source: string } | null>(null);

  useEffect(() => {
    if (!map) return;

    // unselect previous feature
    if (lastSelectedRef.current) {
      const { id, source } = lastSelectedRef.current;
      if (map.getSource(source)) {
        map.setFeatureState({ source, id }, { selected: false });
      }
      lastSelectedRef.current = null;
    }
    // select new feature
    if (selectedFeature) {
      const sourceId = `${selectedFeature.layerId}-source`; // sourceId is alsway layerId-source
      const featureId = selectedFeature.featureId;

      //debug
      console.log("MapHighlighter attempting to highlight:", {
        sourceId,
        featureId,
        sourceExists: !!map.getSource(sourceId),
      });

      if (map.getSource(sourceId)) {
        map.setFeatureState(
          { source: sourceId, id: featureId },
          { selected: true }
        );
        lastSelectedRef.current = { id: featureId, source: sourceId };
      }
    }
  }, [map, selectedFeature]);

  return null;
}
