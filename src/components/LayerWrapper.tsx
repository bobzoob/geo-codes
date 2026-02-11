import type { LayerConfig } from "../types/state";
import { layerRegistry } from "../layers/layerRegistry";
import { useAppState } from "../state/appContext";

/**
 * this is the connector
 * retrieves pre-processed data from global state
 * passes it to the specific rendering plugin
 *  */
interface LayerWrapperProps {
  layer: LayerConfig;
}

export function LayerWrapper({ layer }: LayerWrapperProps) {
  const { state } = useAppState();
  const { processedData, dictionaries, sources } = state;

  // DATA RETRIEVAL
  // we take the pre-processed data from global pipline
  const data = processedData[layer.id];
  if (!data || data.type !== "FeatureCollection") return null;
  // we look up the rendering plugin (point, line..)
  const plugin = layerRegistry[layer.type];
  if (!plugin) {
    console.warn(`No plugin found for layer type: ${layer.type}`);
    return null;
  }

  // DICTIONARY RESOLUTION
  // select correct dictionaries for the layer
  const sourceConfig = sources[layer.sourceId];
  const dictionaryId = layer.dictionaryId || sourceConfig?.dictionaryId;

  const relevantDictionary =
    dictionaryId && dictionaries[dictionaryId]
      ? dictionaries[dictionaryId]
      : Object.values(dictionaries)[0] || {};

  return (
    <plugin.Component
      id={layer.id}
      data={data}
      showAllTooltips={layer.showAllTooltips ?? false}
      entities={relevantDictionary}
      intensityField={layer.intensityField}
      styleConfig={layer.styleConfig}
    />
  );
}
