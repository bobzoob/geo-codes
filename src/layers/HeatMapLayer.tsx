import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import type { HistoricalFeatureCollection } from "../types/geojson";

interface HeatmapLayerProps {
  data: HistoricalFeatureCollection;
}

function HeatmapLayer({ data }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!data || !map) return;

    // Data Buckets
    //leaflet expects: lat, lng, intensity
    const sentPoints: (L.LatLngTuple | [number, number, number])[] = [];
    const receivedPoints: (L.LatLngTuple | [number, number, number])[] = [];

    data.features.forEach((feature) => {
      const geometry = feature.geometry;
      // guard check for typescript
      if (!geometry) return;

      if (geometry.type !== "LineString") return;

      const coords = geometry.coordinates;
      // saftey check for empt coordinates -> there are empty ones!
      if (!coords || coords.length < 2) return;

      // flip log and lat
      // Sent
      const startLng = coords[0][0];
      const startLat = coords[0][1];
      // Received
      const endLng = coords[coords.length - 1][0];
      const endLat = coords[coords.length - 1][1];

      // add to buckets with intensity 0.8
      sentPoints.push([startLat, startLng, 0.8]);
      receivedPoints.push([endLat, endLng, 0.8]);
    });

    // Heat Layers

    // Layer A: Sent (Red/Orange)
    const sentLayer = (L as any).heatLayer(sentPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      gradient: { 0.4: "gold", 0.65: "orange", 1: "red" },
    });

    // Layer B: Received (Blue/Cyan)
    const receivedLayer = (L as any).heatLayer(receivedPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      gradient: { 0.4: "cyan", 0.65: "lime", 1: "blue" },
    });

    // add to map
    sentLayer.addTo(map);
    receivedLayer.addTo(map);

    //clean on unmount/data change
    return () => {
      map.removeLayer(sentLayer);
      map.removeLayer(receivedLayer);
    };
  }, [data, map]); // rerun when data changes

  return null; // the component it manipulates map directly, renders nothing to DOM --> performance issues?
}

export default HeatmapLayer;
