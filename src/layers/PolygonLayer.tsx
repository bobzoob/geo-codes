import { Source, Layer } from "react-map-gl/maplibre";
import type { LayerProps } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import type { LayerComponentProps } from "../types/state";

const PolygonLayer = ({
  id,
  data,
  styleConfig,
  selectedId,
  hoveredId,
}: LayerComponentProps) => {
  const sourceId = `${id}-source`;
  const fillLayerId = `${id}-fill`;
  const outlineLayerId = `${id}-outline`;

  // NORMALIZE COLORS
  // styleConfig.color can be string | string[], we ensure we have a single string.
  const rawColor = styleConfig?.color || "#627BC1";
  const fillColor = Array.isArray(rawColor) ? rawColor[0] : rawColor;

  const rawStroke = styleConfig?.strokeColor || "#4B61D1";
  const strokeColor = Array.isArray(rawStroke) ? rawStroke[0] : rawStroke;

  const baseOpacity = styleConfig?.opacity ?? 0.4;

  // dynamic COLOR
  const dynamicFillColor = [
    "case",
    ["==", ["id"], selectedId || ""],
    "#ff9800",
    ["==", ["id"], hoveredId || ""],
    strokeColor,
    fillColor,
  ];

  // pop when active
  const dynamicFillOpacity = [
    "case",
    ["any", ["==", ["id"], selectedId || ""], ["==", ["id"], hoveredId || ""]],
    baseOpacity + 0.2, // opaque
    baseOpacity,
  ];

  // border for selection
  const dynamicOutlineWidth = [
    "case",
    ["==", ["id"], selectedId || ""],
    3,
    ["==", ["id"], hoveredId || ""],
    2,
    1,
  ];

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
      "fill-color": dynamicFillColor as any,
      "fill-opacity": dynamicFillOpacity as any,
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
      "line-color": [
        "case",
        ["==", ["id"], selectedId || ""],
        "#ffffff",
        strokeColor,
      ] as any,
      "line-width": dynamicOutlineWidth as any,
      "line-opacity": 0.8,
    },
  };

  return (
    <Source
      id={sourceId}
      type="geojson"
      data={data as unknown as FeatureCollection}
      promoteId="id" // this is essential for matching string IDs
    >
      <Layer {...fillStyle} />
      <Layer {...outlineStyle} />
    </Source>
  );
};

export default PolygonLayer;
