import type { ProcessorModule } from "../types/processor";
import type {
  HistoricalFeature,
  HistoricalFeatureCollection,
} from "../types/geojson";

/**
 * THE PROCESSOR REGISTRY
 * This contains all logic for transforming filtered data into new shapes.
 * The most common use case is aggregating individual items (like letters)
 * into geographic hubs (like cities).
 */
export const processorRegistry: Record<string, ProcessorModule> = {
  /**
   * aggregateByProperty
   * Groups features by a specific property ("origin_id") and
   * converts them into a single point with a "count" and "children" list.
   */
  aggregateByProperty: {
    id: "aggregateByProperty",
    execute: (features, params, entities): HistoricalFeatureCollection => {
      const { groupBy } = params;

      if (!groupBy) return { type: "FeatureCollection", features };

      // Grouping
      const groups: Record<string, HistoricalFeature[]> = {};

      features.forEach((f: HistoricalFeature) => {
        const val = f.properties[groupBy];
        if (!val) return;

        if (!groups[val]) groups[val] = [];
        groups[val].push(f);
      });

      // Transformation
      // map groups into "hub" features
      const processedFeatures: HistoricalFeature[] = Object.entries(groups).map(
        ([key, groupFeatures]: [string, HistoricalFeature[]]) => {
          // but we determine coordinates from the first feature in the group
          const firstFeat = groupFeatures[0];
          let coords: number[] = [0, 0];

          if (firstFeat.geometry?.type === "Point") {
            coords = firstFeat.geometry.coordinates;
          } else if (firstFeat.geometry?.type === "LineString") {
            // for lines we aggregate by the start point ("origin")
            coords = firstFeat.geometry.coordinates[0];
          }

          // Hub ID ("gnd:1234567")
          const hubId = String(key);

          return {
            type: "Feature",
            id: hubId, // root ID for React/Selectors
            geometry: {
              type: "Point",
              coordinates: coords,
            },
            properties: {
              // MapLibre looks for "id" inside properties - MapLibre thing
              id: hubId,
              title: entities[key]?.name || key,
              count: groupFeatures.length,

              // we nest the original filtered features for the Popup list
              children: groupFeatures,

              // but keep track of what kind of data was aggregated
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
