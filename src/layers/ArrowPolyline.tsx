import { Polyline, Popup, Tooltip, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet-polylinedecorator";
import type { Polyline as PolylineType } from "leaflet";

interface ArrowPolylineProps {
  positions: L.LatLngTuple[];
  text: string; // text for the tooltip
  title: string;
  showAllTooltips: boolean;
}

function ArrowPolyline({
  positions,
  text,
  title,
  showAllTooltips,
}: ArrowPolylineProps) {
  const map = useMap();

  const [polylineInstance, setPolylineInstance] = useState<PolylineType | null>(
    null
  );
  // this function will be called by React as soon as DOM is created
  const polylineRefCallback = (instance: PolylineType | null) => {
    if (instance) {
      setPolylineInstance(instance);
    }
  };
  // this effect will ONLY run when polylineInstance changes from null to a real value
  useEffect(() => {
    // here we add the decorator to the polyline instance held in the ref
    if (!map || !polylineInstance) {
      return;
    }

    // polylineRef.current is the actual Leaflet Polyline object, created by the <Polyline> component from react-leaflet
    const decorator = L.polylineDecorator(polylineInstance, {
      patterns: [
        {
          offset: "100%",
          repeat: 0,
          symbol: L.Symbol.arrowHead({
            pixelSize: 15,
            polygon: false,
            pathOptions: {
              stroke: true,
              color: "#3388ff",
              fillOpacity: 1,
              weight: 2,
            },
          }),
        },
      ],
    }).addTo(map);

    // remove the decorator when component unmounts
    return () => {
      map.removeLayer(decorator);
    };
  }, [map, polylineInstance]); // dependency array -> impotant, to let rendering not only depand on map

  return (
    <Polyline ref={polylineRefCallback} positions={positions}>
      <Tooltip sticky permanent={showAllTooltips}>
        <strong>{title}</strong>
      </Tooltip>
      <Popup>
        <strong>{title}</strong>
        <p>{text}</p>
      </Popup>
    </Polyline>
  );
}

export default ArrowPolyline;
