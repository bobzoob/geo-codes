import { useEffect } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";
import type { LayerProps } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import type { HistoricalFeatureCollection, EntityMap } from "../types/geojson";

interface ArrowLayerProps {
  id: string;
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
  entities: EntityMap;
}

function ArrowLayer({ id, data }: ArrowLayerProps) {
  const { current: map } = useMap();

  const sourceId = `${id}-source`;
  const lineLayerId = `${id}-lines`;
  const symbolLayerId = `${id}-symbol`;

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

  // Styles with STRICT FILTERS

  // Layer A: Lines
  const lineStyle: LayerProps = {
    id: lineLayerId,
    type: "line",
    // STRICT FILTER: we only allow LineString or MultiLineString
    filter: [
      "match",
      ["geometry-type"],
      ["LineString", "MultiLineString"],
      true,
      false,
    ],
    paint: {
      "line-color": "#3388ff",
      "line-opacity": 0.6,
      "line-width": ["interpolate", ["linear"], ["zoom"], 5, 1, 12, 3],
    },
    // Layout ordering: Lines should generally be below points..?
  };

  // Layer B: Arrow Heads
  const arrowStyle: LayerProps = {
    id: symbolLayerId,
    type: "symbol",
    // STRICT FILTER: we only allow LineString or MultiLineString
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
      "icon-size": 0.8,
      "icon-allow-overlap": true,
      "icon-rotate": 0,
      visibility: "visible",
    },
    minzoom: 9,
  };

  return (
    <Source
      id={sourceId}
      type="geojson"
      data={data as FeatureCollection}
      promoteId="id"
    >
      <Layer {...lineStyle} />
      <Layer {...arrowStyle} />
    </Source>
  );
}

export default ArrowLayer;
