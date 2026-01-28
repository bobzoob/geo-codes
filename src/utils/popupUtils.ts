import type { EntityMap } from "../types/geojson";
import type { PopupFieldConfig } from "../types/state";

import { AUTHORITY_MAP } from "../config/authorities";

export interface ResolvedEntity {
  name: string;
  url?: string;
}
export interface ProcessedField {
  label?: string;
  value: any;
  type: string;
  url?: string;
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
 * generate Authority URLs
 */
const resolveAndFilter = (
  ids: any,
  entities: EntityMap,
  typeFilter?: string,
  isLinkable?: boolean
): ResolvedEntity[] => {
  if (!ids) return [];

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
      const cleanId = typeof id === "string" ? id.trim() : id;
      let entity = entities[cleanId];

      if (!entity) {
        const fuzzyKey = Object.keys(entities).find(
          (k) => k.trim() === cleanId
        );
        if (fuzzyKey) entity = entities[fuzzyKey];
      }

      if (!entity) {
        return { name: cleanId }; // return raw ID if not found
      }

      if (
        typeFilter &&
        entity.type &&
        entity.type.toLowerCase() !== typeFilter.toLowerCase()
      ) {
        return null;
      }

      // URL GENERATION LOGIC
      let url = undefined;
      if (isLinkable && entity.authority) {
        // we look for first authority key that matches our config ("gnd", "geonames")
        const authKey = Object.keys(entity.authority).find(
          (key) => AUTHORITY_MAP[key]
        );
        if (authKey) {
          url = `${AUTHORITY_MAP[authKey]}${entity.authority[authKey]}`;
        }
      }

      return { name: entity.name, url };
    })
    .filter((item): item is ResolvedEntity => item !== null); // filter out null
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
  const fields: ProcessedField[] = [];

  config.forEach((conf) => {
    // SPECIAL CASE: Composite Header (Sender to Recipient)
    if (conf.type === "header" && conf.field === "composite_letter_header") {
      const senders = resolveAndFilter(props.sender_ids, entities);
      const recipients = resolveAndFilter(props.recipient_ids, entities);

      // we extract only names, not URLS
      const senderText =
        senders.length > 0
          ? senders.map((s) => s.name).join(", ")
          : "Unknown Sender";
      const recipientText =
        recipients.length > 0
          ? recipients.map((r) => r.name).join(", ")
          : "Unknown Recipient";

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
    let fieldUrl: string | undefined = undefined;

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
        const shouldLink = conf.isLinkable !== false; // isLinkable default is: true

        const resolved = resolveAndFilter(
          rawValue,
          entities,
          conf.entityTypeFilter,
          shouldLink
        );
        if (resolved.length === 0) return;
        if (conf.type === "text") {
          // For text, we take the first resolved item's name and url
          processedValue = resolved[0].name;
          fieldUrl = resolved[0].url;
        } else {
          // fallback
          processedValue = resolved;
        }
      }
    }

    fields.push({
      label: conf.label,
      type: conf.type,
      value: processedValue,
      url: fieldUrl,
    });
  });

  return {
    fields,
    url: props.url, // source URL - i still need to implement this!
  };
};
