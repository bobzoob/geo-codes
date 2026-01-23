import type { ProcessorModule } from "../types/processor";
import type { HistoricalFeature } from "../types/geojson";

export const processorRegistry: Record<string, ProcessorModule> = {
  /**
   * This functions aggregates values by property.
   * and turns them into points
   */
  aggregateByProperty: {
    id: "aggregateByProperty",
    execute: (features, params, entities) => {
      const { groupBy } = params;
      if (!groupBy) return { type: "FeatureCollection", features };

      const groups: Record<string, HistoricalFeature[]> = {};

      features.forEach((f) => {
        const val = f.properties[groupBy];
        if (!val) return;

        if (!groups[val]) groups[val] = [];
        groups[val].push(f);
      });

      const processedFeatures: HistoricalFeature[] = Object.entries(groups).map(
        ([key, groupFeatures]) => {
          // we determine coordinates from the first feature in the group
          const firstFeat = groupFeatures[0];
          let coords: number[] = [0, 0];

          if (firstFeat.geometry?.type === "Point") {
            coords = firstFeat.geometry.coordinates;
          } else if (firstFeat.geometry?.type === "LineString") {
            // For lines, we usually aggregate by the start point (Origin)
            coords = firstFeat.geometry.coordinates[0];
          }

          return {
            type: "Feature",
            id: key, // ID of the group (for example: city)
            geometry: { type: "Point", coordinates: coords },
            properties: {
              // generic properties created by the processor
              title: entities[key]?.name || key,
              count: groupFeatures.length,
              // nest the original features so the Popup can list them
              children: groupFeatures,
              originalType: firstFeat.geometry?.type,
            },
          };
        }
      );

      return {
        type: "FeatureCollection",
        features: processedFeatures,
      };
    },
  },
};
