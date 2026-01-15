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

  if (intensityField) {
    circleRadius = [
      "interpolate",
      ["linear"],
      ["get", intensityField],
      1,
      4, // min value, min size
      50,
      20, // max value, max size
    ];
  } else {
    // STATIC SIZE: based on zoom only
    circleRadius = ["interpolate", ["linear"], ["zoom"], 5, 4, 12, 7];
  }
  // CIRCLE STYLE
  const circleStyle: LayerProps = {
    id: circleLayerId,
    type: "circle",
    // only allow Points or MultiPoints
    filter: ["match", ["geometry-type"], ["Point", "MultiPoint"], true, false],
    paint: {
      "circle-radius": circleRadius,
      "circle-color": "#ff7800",
      "circle-stroke-width": 1,
      "circle-stroke-color": "#ffffff",
      "circle-opacity": 0.9,
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
