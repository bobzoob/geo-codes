import { Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import type { LayerComponentProps } from "../types/state";

const GeoJSONLayer = ({ id, data }: LayerComponentProps) => {
  // there are two layers, one for fill, one for outline, rendered simultaniusly
  const fillLayerId = `${id}-fill`;
  const outlineLayerId = `${id}-outline`;
  return (
    <Source id={id} type="geojson" data={data as unknown as FeatureCollection}>
      <Layer
        id={fillLayerId}
        type="fill"
        paint={{
          "fill-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#4B61D1", // color when hovered (slightly darker)
            "#627BC1", // default color
          ],
          "fill-opacity": 0.4,
        }}
      />
      <Layer
        id={outlineLayerId}
        type="line"
        paint={{
          "line-color": "#4B61D1",
          "line-width": 1,
          "line-opacity": 0.8,
        }}
      />
    </Source>
  );
};

export default GeoJSONLayer;
