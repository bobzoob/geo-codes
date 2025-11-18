import ArrowPolyline from "../layers/ArrowPolyline";
import type { HistoricalFeatureCollection } from "../types/geojson";
import L from "leaflet";

interface ArrowLayerProps {
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
}

function ArrowLayer({ data, showAllTooltips }: ArrowLayerProps) {
  return (
    <>
      {data.features.map((feature, index) => {
        // typescript often causes errors when it cant be sure that we only process the correct type, here: LineString
        if (feature.geometry.type !== "LineString") {
          return null;
        }

        // swap coordinates! GEOjson and leaflet are opposite here
        const positions = feature.geometry.coordinates.map(
          (coord) => [coord[1], coord[0]] as L.LatLngTuple
        );

        return (
          <ArrowPolyline
            key={index}
            positions={positions}
            title={feature.properties.name}
            text={feature.properties.description}
            showAllTooltips={showAllTooltips}
          />
        );
      })}
    </>
  );
}

export default ArrowLayer;
