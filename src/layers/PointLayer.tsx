import { Source, Layer } from "react-map-gl/maplibre";
import type { LayerProps } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import type { HistoricalFeatureCollection, EntityMap } from "../types/geojson";

interface PointLayerProps {
  id: string;
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
  entities: EntityMap;
  intensityField?: string;
}

function PointLayer({
  id,
  data,
  showAllTooltips,
  intensityField,
}: PointLayerProps) {
  const sourceId = `${id}-source`;
  const circleLayerId = `${id}-circle`;
  const labelLayerId = `${id}-label`;

  // DYNAMIC SIZE
  let circleRadius: any;
  let circleColor: any;

  if (intensityField) {
    circleRadius = [
      "interpolate",
      ["linear"],
      ["get", intensityField],
      1,
      4, // Smallest
      50,
      12, // Medium
      150,
      22, // Large
      250,
      30, // Largest
    ];

    circleColor = [
      "interpolate",
      ["linear"],
      ["get", intensityField],
      1,
      "#FFEB3B", // Bright Yellow
      50,
      "#FB8C00", // Deep Orange
      150,
      "#D32F2F", // Red
      250,
      "#880E4F", // Dark Burgundy
    ];
  } else {
    // STATIC SIZE: based on zoom only
    circleRadius = ["interpolate", ["linear"], ["zoom"], 5, 4, 12, 7];
    circleColor = "#808080"; // grey
  }
  // CIRCLE STYLE
  const circleStyle: LayerProps = {
    id: circleLayerId,
    type: "circle",
    // only allow Points or MultiPoints
    filter: ["match", ["geometry-type"], ["Point", "MultiPoint"], true, false],
    paint: {
      "circle-radius": circleRadius,
      "circle-color": circleColor,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#ffffff",
      "circle-opacity": 0.85,
    },
  };

  // LABEL STYLE
  const labelStyle: LayerProps = {
    id: labelLayerId,
    type: "symbol",
    // STRICT FILTER: Only allow Points
    filter: ["match", ["geometry-type"], ["Point", "MultiPoint"], true, false],
    layout: {
      "text-field": ["get", "title"],
      "text-font": ["Open Sans Regular"],
      "text-size": 12,
      "text-offset": [0, 1.2],
      "text-anchor": "top",
      "text-optional": true,
      visibility: showAllTooltips ? "visible" : "none",
    },
    paint: {
      "text-color": "#000000",
      "text-halo-color": "#ffffff",
      "text-halo-width": 2,
    },
  };

  return (
    <Source id={sourceId} type="geojson" data={data as FeatureCollection}>
      <Layer {...circleStyle} />
      <Layer {...labelStyle} />
    </Source>
  );
}

export default PointLayer;
