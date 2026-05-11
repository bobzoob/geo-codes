import { useMemo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import type { LayerProps } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import type { LayerComponentProps } from "../types/state";

/**
 * HELPER: Calculates the approximate area of a polygon.
 * We use the Shoelace formula on raw coordinates. It doesn't need to be
 * perfectly accurate in square meters; it just needs to give us a relative
 * size so we can sort overlapping polygons correctly!
 */
const calculateGeometryArea = (geometry: any): number => {
  if (!geometry || !geometry.coordinates) return 0;

  const calcRingArea = (ring: any[]) => {
    if (!ring || ring.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      const p1 = ring[i];
      const p2 = ring[i + 1];
      if (p1 && p2 && p1.length >= 2 && p2.length >= 2) {
        area += (p2[0] - p1[0]) * (p2[1] + p1[1]);
      }
    }
    return Math.abs(area / 2);
  };

  let totalArea = 0;
  if (geometry.type === "Polygon") {
    totalArea = calcRingArea(geometry.coordinates[0]);
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((polygon: any[]) => {
      if (polygon && polygon.length > 0) {
        totalArea += calcRingArea(polygon[0]);
      }
    });
  }
  return totalArea;
};

const PolygonLayer = ({ id, data, styleConfig }: LayerComponentProps) => {
  const sourceId = `${id}-source`;
  const fillLayerId = `${id}-fill`;
  const outlineLayerId = `${id}-outline`;

  // DATA BLIND SORTING:
  // Sort features by area descending (largest first, smallest last).
  // MapLibre draws features in array order, so drawing the largest first
  // ensures the smaller ones are drawn on top and remain clickable!
  const sortedData = useMemo(() => {
    if (!data || !data.features) return data;

    const sortedFeatures = [...data.features].sort((a, b) => {
      const areaA = calculateGeometryArea(a.geometry);
      const areaB = calculateGeometryArea(b.geometry);
      return areaB - areaA; // Descending order
    });

    return {
      ...data,
      features: sortedFeatures,
    };
  }, [data]);

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
      data={sortedData as unknown as FeatureCollection} // Use the sorted data here!
      promoteId="id"
    >
      <Layer {...fillStyle} />
      <Layer {...outlineStyle} />
    </Source>
  );
};

export default PolygonLayer;
