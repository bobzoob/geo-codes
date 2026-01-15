import type { EntityMap } from "../types/geojson";
import type { PopupFieldConfig } from "../types/state";

// The shape of data passed to the UI
export interface ProcessedField {
  label?: string;
  value: any;
  type: string;
}

export interface GenericPopupData {
  fields: ProcessedField[];
  url?: string;
}

// Helper to resolve IDs
const resolve = (ids: any, entities: EntityMap): string[] => {
  if (!ids) return [];
  let list = Array.isArray(ids) ? ids : [ids];
  // Handle stringified JSON if necessary
  if (typeof ids === "string" && ids.startsWith("[")) {
    try {
      list = JSON.parse(ids);
    } catch (e) {}
  }
  return list.map((id: string) => entities[id]?.label || id).filter(Boolean);
};

export const extractGenericPopupData = (
  feature: { properties: any },
  config: PopupFieldConfig[],
  entities: EntityMap
): GenericPopupData => {
  const props = feature.properties;
  const fields: ProcessedField[] = [];

  config.forEach((conf) => {
    let rawValue = props[conf.field];

    // Skip if data is missing
    if (!rawValue || (Array.isArray(rawValue) && rawValue.length === 0)) return;

    let processedValue = rawValue;

    // Resolve Entities (if needed)
    if (conf.resolveEntities) {
      if (conf.type === "timed-list") {
        // Special handling for [ID, Date] arrays
        if (typeof rawValue === "string")
          try {
            rawValue = JSON.parse(rawValue);
          } catch (e) {}

        processedValue = rawValue.map((entry: string[]) => ({
          label: entities[entry[0]]?.label || "Unknown",
          subLabel: entry[1],
        }));
      } else {
        // Standard ID list
        processedValue = resolve(rawValue, entities);
      }
    }

    fields.push({
      label: conf.label,
      type: conf.type,
      value: processedValue,
    });
  });

  return {
    fields,
    url: props.url,
  };
};
