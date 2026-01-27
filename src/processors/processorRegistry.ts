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
   * Groups features by a specific property (e.g., "origin_id") and
   * converts them into a single Point (Hub) with a "count" and "children" list.
   */
  aggregateByProperty: {
    id: "aggregateByProperty",
    execute: (features, params, entities): HistoricalFeatureCollection => {
      const { groupBy } = params;

      // If no grouping property is provided, return data as is
      if (!groupBy) return { type: "FeatureCollection", features };

      // 1. Grouping Logic
      const groups: Record<string, HistoricalFeature[]> = {};

      features.forEach((f: HistoricalFeature) => {
        const val = f.properties[groupBy];
        if (!val) return;

        if (!groups[val]) groups[val] = [];
        groups[val].push(f);
      });

      // 2. Transformation Logic
      // We map the groups into new "Hub" features
      const processedFeatures: HistoricalFeature[] = Object.entries(groups).map(
        ([key, groupFeatures]: [string, HistoricalFeature[]]) => {
          // Determine coordinates from the first feature in the group
          const firstFeat = groupFeatures[0];
          let coords: number[] = [0, 0];

          if (firstFeat.geometry?.type === "Point") {
            coords = firstFeat.geometry.coordinates;
          } else if (firstFeat.geometry?.type === "LineString") {
            // For lines (correspondence), we aggregate by the start point (Origin)
            coords = firstFeat.geometry.coordinates[0];
          }

          // Create the Hub ID (usually a GND ID like 'gnd:4028557-1')
          const hubId = String(key);

          return {
            type: "Feature",
            id: hubId, // Root ID for React/Selectors
            geometry: {
              type: "Point",
              coordinates: coords,
            },
            properties: {
              // ID Promotion: MapLibre looks for 'id' inside properties
              id: hubId,

              // Resolve the city name using the entities dictionary
              title: entities[key]?.name || key,

              // Metadata for the Map (radius scaling) and UI (labels)
              count: groupFeatures.length,

              // Nest the original filtered features for the Popup list
              children: groupFeatures,

              // Keep track of what kind of data was aggregated
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
