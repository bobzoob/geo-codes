import React, { type ComponentType } from "react";
import type { HistoricalFeatureCollection } from "../types/geojson";
import type { LayerComponentProps } from "../types/state";

// ** ADD NWE layer rendering components HERE **
import GeoJSONLayer from "./GeoJSONLayer";
import PointLayer from "./PointLayer";
import ArrowLayer from "./ArrowLayer";

// props that every layer component must accept
export interface LayerRendererProps {
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
}

// registrys type signature
// keys are strings and values are React components that accept LayerRendererProps
type LayerRegistry = Record<string, React.ComponentType<LayerRendererProps>>;

// registry instance
export const layerRegistry: Record<
  string,
  ComponentType<LayerComponentProps>
> = {
  // ** TO ADD A NEW LAYER TYPE, ADD AN ENTRY HERE **
  polygon: GeoJSONLayer,
  point: PointLayer,
  line: ArrowLayer,
};
