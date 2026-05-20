import { useEffect } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";
import type { LayerProps } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import type { HistoricalFeatureCollection, EntityMap } from "../types/geojson";
import type { LayerComponentProps } from "../types/state";

interface ArrowLayerProps extends LayerComponentProps {
  id: string;
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
  entities: EntityMap;
  // array of highlighted IDs for multi-selection/grouping
  highlightedIds?: string[];
  hoveredId?: string | null;
}

function ArrowLayer({
  id,
  data,
  highlightedIds = [],
  hoveredId,
}: ArrowLayerProps) {
  const { current: map } = useMap();

  const sourceId = `${id}-source`;
  const lineLayerId = `${id}-lines`;
  const symbolLayerId = `${id}-symbol`;
  const highlightLayerId = `${id}-highlight`;

  // Arrow Icon
  useEffect(() => {
    if (!map) return;
    if (!map || map.hasImage("arrow-head")) return;

    const width = 24;
    const height = 24;
    const img = new Image(width, height);
    img.onload = () => {
      if (!map.hasImage("arrow-head")) {
        try {
          map.addImage("arrow-head", img);
        } catch (e) {
          // but we ignore this error if another layer added it milliseconds ago
          console.warn("Arrow image already added.");
        }
      }
    };
    img.src = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 24 24'%3E%3Cpath fill='%233388ff' d='M12 2L22 22L12 18L2 22L12 2Z' /%3E%3C/svg%3E`;
  }, [map]);

  // HIGHLIGHT LOGIC
  // her we use a dummy "__none__" if the array is empty to prevent MapLibre parsing errors
  const safeHighlightedIds =
    highlightedIds.length > 0 ? highlightedIds : ["__none__"];

  const isHighlighted = [
    "in",
    ["to-string", ["get", "id"]], // to safely get the ID as a string
    ["literal", safeHighlightedIds],
  ];

  const isHovered = [
    "==",
    ["to-string", ["get", "id"]],
    hoveredId ? String(hoveredId) : "__none__",
  ];

  // DYNAMIC LINE STYLE

  // Lines
  const lineColor = [
    "case",
    isHighlighted,
    "#ff9800",
    isHovered,
    "#ffffff",
    "#3388ff",
  ] as any;

  const lineWidth = [
    "interpolate",
    ["linear"],
    ["zoom"],
    // At Zoom 5:
    5,
    [
      "case",
      isHighlighted,
      5,
      isHovered,
      4, //  width if hovered
      1, // default width at zoom 5
    ],
    // At Zoom 12:
    12,
    [
      "case",
      isHighlighted,
      8, // slight grow
      isHovered,
      6,
      3, // default width at zoom 12
    ],
  ] as any;

  const lineOpacity = [
    "case",
    ["any", isHighlighted, isHovered],
    1,
    0.6,
  ] as any;

  const lineStyle: LayerProps = {
    id: lineLayerId,
    type: "line",
    filter: [
      "match",
      ["geometry-type"],
      ["LineString", "MultiLineString"],
      true,
      false,
    ],
    paint: {
      "line-color": lineColor,
      "line-width": lineWidth,
      "line-opacity": lineOpacity,
    },
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
  };

  // Highlight Layer
  const highlightStyle: LayerProps = {
    id: highlightLayerId,
    type: "line",
    filter: [
      "match",
      ["geometry-type"],
      ["LineString", "MultiLineString"],
      true,
      false,
    ],
    paint: {
      "line-color": "#ff9800",
      "line-width": 4,
      "line-opacity": ["case", isHighlighted, 1, 0] as any,
    },
  };

  // ARROW HEADS (Symbols)
  const arrowStyle: LayerProps = {
    id: symbolLayerId,
    type: "symbol",
    filter: [
      "match",
      ["geometry-type"],
      ["LineString", "MultiLineString"],
      true,
      false,
    ],
    layout: {
      "symbol-placement": "line",
      "symbol-spacing": 100,
      "icon-image": "arrow-head",
      "icon-size": [
        "case",
        ["any", isHighlighted, isHovered],
        1.0, //  larger icon when active
        0.8,
      ] as any,
      "icon-allow-overlap": true,
      "icon-rotate": 90, //?
      visibility: "visible",
    },
    // but we only want to show the arrow heads when zoomed in
    minzoom: 6,
  };

  return (
    <Source
      id={sourceId}
      type="geojson"
      data={data as FeatureCollection}
      promoteId="id"
    >
      <Layer {...lineStyle} />
      <Layer {...highlightStyle} />
      <Layer {...arrowStyle} />
    </Source>
  );
}

export default ArrowLayer;
