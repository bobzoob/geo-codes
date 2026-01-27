import { Source, Layer } from "react-map-gl/maplibre";
import type { LayerProps } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import type { HistoricalFeatureCollection } from "../types/geojson";
import type { LayerComponentProps } from "../types/state";

/**
 * Define the style configuration shape for Point Layers
 */
export interface PointStyleConfig {
  color?: string | string[]; // Single color or array for a gradient ramp
  radius?: number | [number, number]; // Single size or [min, max] for scaling
  opacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

interface PointLayerProps extends LayerComponentProps {
  id: string;
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
  intensityField?: string; // The property key to drive scaling (e.g., "count")
  styleConfig?: PointStyleConfig;
}

function PointLayer({
  id,
  data,
  showAllTooltips,
  //entities,
  intensityField,
  styleConfig,
}: PointLayerProps) {
  const sourceId = `${id}-source`;
  const circleLayerId = `${id}-circle`;
  const labelLayerId = `${id}-label`;

  // 1. EXTRACT STYLE CONFIG WITH DEFAULTS
  const config = styleConfig || {};
  const baseColor = config.color || "#3388ff";
  const baseRadius = config.radius || 6;

  // 2. CONSTRUCT RADIUS EXPRESSION
  let circleRadius: any;
  if (intensityField && Array.isArray(baseRadius)) {
    const min = baseRadius[0];
    const max = baseRadius[1];

    circleRadius = [
      "interpolate",
      ["linear"],
      ["get", intensityField],
      1,
      min, // 1 entry: Smallest
      10,
      min + (max - min) * 0.2, // 10 entries: Small-Medium
      50,
      min + (max - min) * 0.5, // 50 entries: Medium
      150,
      min + (max - min) * 0.8, // 150 entries: Large
      300,
      max, // 300+ entries: Maximum
    ];
  } else if (Array.isArray(baseRadius)) {
    circleRadius = baseRadius[0]; // Fallback if no intensity field
  } else {
    // Static size that grows slightly with zoom
    circleRadius = [
      "interpolate",
      ["linear"],
      ["zoom"],
      5,
      baseRadius,
      12,
      baseRadius * 1.5,
    ];
  }

  // 3. CONSTRUCT COLOR EXPRESSION
  let circleColor: any;
  if (intensityField && Array.isArray(baseColor)) {
    // color ramp: [interpolate, linear, get(field), val1, color1, val2, color2...]
    circleColor = ["interpolate", ["linear"], ["get", intensityField]];

    const stops = [1, 10, 50, 150, 300];

    baseColor.forEach((color, index) => {
      const stopIndex = Math.round(
        (index / (baseColor.length - 1)) * (stops.length - 1)
      );
      const stopValue = stops[stopIndex];

      circleColor.push(stopValue, color);
    });
  } else {
    circleColor = baseColor;
  }

  // 4. CIRCLE LAYER DEFINITION
  const circleStyle: LayerProps = {
    id: circleLayerId,
    type: "circle",
    filter: ["match", ["geometry-type"], ["Point", "MultiPoint"], true, false],
    paint: {
      "circle-radius": circleRadius,
      "circle-color": circleColor,
      "circle-stroke-width": config.strokeWidth ?? 1,
      "circle-stroke-color": config.strokeColor || "#ffffff",
      "circle-opacity": config.opacity ?? 0.8,
    },
  };

  // 5. LABEL LAYER DEFINITION
  const labelStyle: LayerProps = {
    id: labelLayerId,
    type: "symbol",
    filter: ["match", ["geometry-type"], ["Point", "MultiPoint"], true, false],
    layout: {
      "text-field": ["get", "title"],
      "text-font": ["Open Sans Regular"],
      "text-size": 12,
      "text-offset": [0, 1.5],
      "text-anchor": "top",
      "text-optional": true,
      // Visibility controlled by the "Flashlight" toggle in UI
      visibility: showAllTooltips ? "visible" : "none",
    },
    paint: {
      "text-color": "#333333",
      "text-halo-color": "#ffffff",
      "text-halo-width": 2,
    },
  };

  return (
    <Source
      id={sourceId}
      type="geojson"
      data={data as FeatureCollection}
      promoteId="id"
    >
      <Layer {...circleStyle} />
      <Layer {...labelStyle} />
    </Source>
  );
}

export default PointLayer;
