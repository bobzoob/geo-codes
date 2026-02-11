import { Source, Layer } from "react-map-gl/maplibre";
import type { LayerProps } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import type { LayerComponentProps } from "../types/state";

const PolygonLayer = ({ id, data, styleConfig }: LayerComponentProps) => {
  const sourceId = `${id}-source`;
  const fillLayerId = `${id}-fill`;
  const outlineLayerId = `${id}-outline`;

  // NORMALIZE COLORS
  // styleConfig.color can be string | string[], we ensure we have a single string.
  const rawColor = styleConfig?.color || "#627BC1";
  const fillColor = Array.isArray(rawColor) ? rawColor[0] : rawColor;

  const rawStroke = styleConfig?.strokeColor || "#4B61D1";
  const strokeColor = Array.isArray(rawStroke) ? rawStroke[0] : rawStroke;

  const opacity = styleConfig?.opacity ?? 0.4;

  // Fill layer
  const fillStyle: LayerProps = {
    id: fillLayerId,
    type: "fill",
    filter: [
      "match",
      ["geometry-type"],
      ["Polygon", "MultiPolygon"],
      true,
      false,
    ],
    paint: {
      "fill-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        strokeColor as string, // to satisfy MapLibre types
        fillColor as string,
      ],
      "fill-opacity": opacity,
    },
  };

  //  Outline layer
  const outlineStyle: LayerProps = {
    id: outlineLayerId,
    type: "line",
    filter: [
      "match",
      ["geometry-type"],
      ["Polygon", "MultiPolygon"],
      true,
      false,
    ],
    paint: {
      "line-color": strokeColor as string,
      "line-width": 1,
      "line-opacity": 0.8,
    },
  };

  return (
    <Source
      id={sourceId}
      type="geojson"
      data={data as unknown as FeatureCollection}
      promoteId="id"
    >
      <Layer {...fillStyle} />
      <Layer {...outlineStyle} />
    </Source>
  );
};

export default PolygonLayer;
