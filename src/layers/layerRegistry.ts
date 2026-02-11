import { type ComponentType } from "react";
import type { LayerComponentProps } from "../types/state";

// ** ADD A NEW layer rendering components HERE **
import PolygonLayer from "./PolygonLayer";
import PointLayer from "./PointLayer";
import ArrowLayer from "./ArrowLayer";

// plugin interface
export interface LayerPlugin {
  Component: ComponentType<LayerComponentProps>;
  getInteractiveIds: (layerId: string) => string[];
  zIndex: number;
}

// registry instance
// ** ADD A NEW LAYER TYPE HERE **
export const layerRegistry: Record<string, LayerPlugin> = {
  point: {
    Component: PointLayer,
    getInteractiveIds: (id) => [`${id}-circle`, `${id}-label`],
    zIndex: 20,
  },
  line: {
    Component: ArrowLayer,
    getInteractiveIds: (id) => [`${id}-lines`, `${id}-symbol`],
    zIndex: 10,
  },
  polygon: {
    Component: PolygonLayer,
    getInteractiveIds: (id) => [`${id}-fill`],
    zIndex: 0,
  },
};
