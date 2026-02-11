import { useMemo } from "react";

import { LayerWrapper } from "./LayerWrapper";
import { useAppState } from "../state/appContext";
import { layerRegistry } from "../layers/layerRegistry";

// LayerManager get its logic from LayerWrapper
function LayerManager() {
  const { state } = useAppState();
  const { layerConfig, processedData } = state;

  if (!processedData) return null; // maybe no data at all
  console.log("No processedData available.");

  // sort layers (points over lines over polygon etc)
  const sortedLayers = useMemo(() => {
    return [...layerConfig].sort((a, b) => {
      const zIndexA = layerRegistry[a.type]?.zIndex ?? 0;
      const zIndexB = layerRegistry[b.type]?.zIndex ?? 0;

      return zIndexA - zIndexB; // ascending: 0 -> 10 -> 20
    });
  }, [layerConfig]);

  // render
  return (
    <>
      {sortedLayers.map((layer) => {
        // if visible
        if (!layer.visible) return null;

        // if data is available
        const layerData = processedData[layer.id];
        if (
          !layerData ||
          !layerData.features ||
          layerData.features.length === 0
        )
          return null;

        // we render the wrapper
        return <LayerWrapper key={layer.id} layer={layer} />;
      })}
    </>
  );
}

export default LayerManager;
