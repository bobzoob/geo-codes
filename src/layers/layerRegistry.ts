import { type ComponentType } from "react";
import type { LayerComponentProps } from "../types/state";
import HeatMapLayer from "./HeatMapLayer";

// ** ADD NWE layer rendering components HERE **
import GeoJSONLayer from "./GeoJSONLayer";
import PointLayer from "./PointLayer";
import ArrowLayer from "./ArrowLayer";

// registry instance
// ComponentType<LayerComponentProps>> to ensure all registered components accept data, showAllTooltips, AND entities
export const layerRegistry: Record<
  string,
  ComponentType<LayerComponentProps>
> = {
  // ** TO ADD A NEW LAYER TYPE, ADD AN ENTRY HERE **
  polygon: GeoJSONLayer,
  point: PointLayer,
  line: ArrowLayer,
  heatmap: HeatMapLayer,
};
