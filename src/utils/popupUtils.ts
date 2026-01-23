import type { EntityMap } from "../types/geojson";
import type { PopupFieldConfig } from "../types/state";

export interface ProcessedField {
  label?: string;
  value: any;
  type: string;
  meta?: {
    listLabelField?: string;
    detailLayerId?: string;
  };
}

export interface GenericPopupData {
  fields: ProcessedField[];
  url?: string;
}

/**
 * Helper to resolve IDs to Names and optionally filter by Entity Type
 */
const resolveAndFilter = (
  ids: any,
  entities: EntityMap,
  typeFilter?: string
): string[] => {
  if (!ids) return [];

  // Handle strings that look like arrays "[id1, id2]" or single strings
  let list: string[] = [];
  if (Array.isArray(ids)) {
    list = ids;
  } else if (typeof ids === "string") {
    if (ids.startsWith("[")) {
      try {
        list = JSON.parse(ids);
      } catch (e) {
        list = [ids];
      }
    } else {
      list = [ids];
    }
  }

  return list
    .map((id) => {
      // additional white-space problems?
      const cleanId = typeof id === "string" ? id.trim() : id;
      let entity = entities[cleanId];

      // we try to find the key in dictionary but trimm whitspace too
      if (!entity) {
        const fuzzyKey = Object.keys(entities).find(
          (k) => k.trim() === cleanId
        );
        if (fuzzyKey) entity = entities[fuzzyKey];
      }

      if (!entity) {
        console.warn(`Lookup failed for ID: "${cleanId}"`);
        return cleanId;
      }

      // we filter for a type (like "Person")
      if (
        typeFilter &&
        entity.type &&
        entity.type.toLowerCase() !== typeFilter.toLowerCase()
      ) {
        return null;
      }
      return entity.name;
    })
    .filter((item): item is string => item !== null && item !== undefined);
};

/**
 * Main function to transform raw GeoJSON properties into UI-ready Popup Data
 */
export const extractGenericPopupData = (
  feature: any,
  config: PopupFieldConfig[],
  entities: EntityMap
): GenericPopupData => {
  const props = feature.properties || {};

  console.log("Available properties in popup:", Object.keys(props));

  // Ensure we have the ID available (from properties or root)
  //const featureId = props.id || feature.id || "";

  const fields: ProcessedField[] = [];

  config.forEach((conf) => {
    // SPECIAL CASE: Composite Header (Sender to Recipient)
    if (conf.type === "header" && conf.field === "composite_letter_header") {
      const senders = resolveAndFilter(props.sender_ids, entities);
      const recipients = resolveAndFilter(props.recipient_ids, entities);

      const senderText =
        senders.length > 0 ? senders.join(", ") : "Unknown Sender";
      const recipientText =
        recipients.length > 0 ? recipients.join(", ") : "Unknown Recipient";

      fields.push({
        type: "header",
        value: `${senderText} to ${recipientText}`,
      });
      return;
    }

    // STANDARD LOGIC:
    let rawValue = props[conf.field];
    // for generic feature-list
    if (conf.type === "feature-list") {
      let listValue = rawValue;
      if (typeof listValue === "string") {
        try {
          listValue = JSON.parse(listValue);
        } catch (e) {
          console.error("Failed to parse feature-list JSON", e);
          return;
        }
      }

      if (!listValue || !Array.isArray(listValue)) return;

      fields.push({
        label: conf.label,
        type: "feature-list",
        value: listValue,
        meta: {
          listLabelField: conf.listLabelField,
          detailLayerId: conf.detailLayerId,
        },
      });
      return;
    }

    if (!rawValue) return;
    if (Array.isArray(rawValue) && rawValue.length === 0) return;

    let processedValue = rawValue;

    if (conf.resolveEntities) {
      if (conf.type === "timed-list") {
        // Handle the specific [ID, Date] array structure
        let listData = rawValue;
        if (typeof rawValue === "string") {
          try {
            listData = JSON.parse(rawValue);
          } catch (e) {}
        }
        if (Array.isArray(listData)) {
          processedValue = listData.map((entry: any) => ({
            label: entities[entry[0]]?.name || entry[0],
            subLabel: entry[1],
          }));
        }
      } else {
        // Standard ID resolution
        processedValue = resolveAndFilter(
          rawValue,
          entities,
          conf.entityTypeFilter
        );
        if (processedValue.length === 0) return;
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
