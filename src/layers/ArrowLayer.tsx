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
}

function ArrowLayer({ id, data, selectedId, hoveredId }: ArrowLayerProps) {
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

  // DYNAMIC LINE STYLE

  // Layer A: Lines
  const lineColor = [
    "case",
    ["==", ["id"], selectedId || ""],
    "#ff9800",
    ["==", ["id"], hoveredId || ""],
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
      ["==", ["id"], selectedId || ""],
      5, // Fixed width if selected
      ["==", ["id"], hoveredId || ""],
      4, // Fixed width if hovered
      1, // Default width at zoom 5
    ],
    // At Zoom 12:
    12,
    [
      "case",
      ["==", ["id"], selectedId || ""],
      8, // Grow slightly at high zoom even if selected
      ["==", ["id"], hoveredId || ""],
      6,
      3, // Default width at zoom 12
    ],
  ] as any;

  const lineOpacity = [
    "case",
    ["any", ["==", ["id"], selectedId || ""], ["==", ["id"], hoveredId || ""]],
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
      "line-color": lineColor as any,
      "line-width": lineWidth as any,
      "line-opacity": lineOpacity as any,
    },
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
  };

  //
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
      "line-opacity": [
        "case",
        ["==", ["get", "id"], selectedId || ""], // Check if this feature is selected
        1,
        0,
      ],
    },
  };

  // 3. ARROW HEADS (Symbols)
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
        [
          "any",
          ["==", ["id"], selectedId || ""],
          ["==", ["id"], hoveredId || ""],
        ],
        1.0, // Slightly larger icon when active
        0.8,
      ] as any,
      "icon-allow-overlap": true,
      "icon-rotate": 90, // Adjust based on your SVG orientation
      visibility: "visible",
    },
    // Only show arrow heads when zoomed in enough to see direction clearly
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
