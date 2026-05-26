import { useEffect } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";
import type { LayerProps } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import type { HistoricalFeatureCollection, EntityMap } from "../types/geojson";
import type { LayerComponentProps } from "../types/state";
import { getHighlightExpressions } from "../utils/layerUtils";

interface ArrowLayerProps extends LayerComponentProps {
  id: string;
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
  entities: EntityMap;
  highlightedIds?: string[];
  hoveredId?: string | null;
}

function ArrowLayer({
  id,
  data,
  highlightedIds = [],
  hoveredId,
  styleConfig,
}: ArrowLayerProps) {
  const { current: map } = useMap();

  const sourceId = `${id}-source`;
  const lineLayerId = `${id}-lines`;
  const symbolLayerId = `${id}-symbol`;
  const highlightLayerId = `${id}-highlight`;

  // we extract the base color and opacity from config but fallback to blue
  const baseColor = (styleConfig?.color as string) || "#3388ff";
  const baseOpacity = styleConfig?.opacity ?? 0.6;

  // must make image name unique per layer so different layers can have different colored arrows
  const imageName = `arrow-head-${id}`;

  // hightlight
  const { isHighlighted, isHovered } = getHighlightExpressions(
    highlightedIds,
    hoveredId
  );

  // Arrow Icon
  useEffect(() => {
    if (!map) return;
    if (map.hasImage(imageName)) return;

    const width = 24;
    const height = 24;
    const img = new Image(width, height);
    img.onload = () => {
      if (!map.hasImage(imageName)) {
        try {
          map.addImage(imageName, img);
        } catch (e) {
          console.warn(`Arrow image ${imageName} already added.`);
        }
      }
    };

    // hex color encode for SVG data URI
    const encodedColor = encodeURIComponent(baseColor);
    img.src = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 24 24'%3E%3Cpath fill='${encodedColor}' d='M12 2L22 22L12 18L2 22L12 2Z' /%3E%3C/svg%3E`;
  }, [map, imageName, baseColor]);

  // DYNAMIC LINE STYLE

  //  Lines
  const lineColor = [
    "case",
    isHighlighted,
    "#ff9800",
    isHovered,
    "#ffffff",
    baseColor,
  ] as any;

  const lineWidth = [
    "interpolate",
    ["linear"],
    ["zoom"],
    5,
    ["case", isHighlighted, 5, isHovered, 4, 1],
    12,
    ["case", isHighlighted, 8, isHovered, 6, 3],
  ] as any;

  const lineOpacity = [
    "case",
    ["any", isHighlighted, isHovered],
    1,
    baseOpacity,
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

  // ARROW HEADS
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
      "icon-image": imageName,
      "icon-size": ["case", ["any", isHighlighted, isHovered], 1.0, 0.8] as any,
      "icon-allow-overlap": true,
      "icon-rotate": 90,
      visibility: "visible",
    },
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
