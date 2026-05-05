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
  componentId?: string;
  params?: Record<string, any>;
  meta?: {
    listLabelField?: string;
    listSecondaryField?: string;
    detailTemplateId?: string;
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

  const list: string[] = Array.isArray(ids)
    ? ids
    : typeof ids === "string" && ids.startsWith("[")
    ? JSON.parse(ids)
    : [ids];

  return list
    .map((id) => {
      const entity = entities[String(id).trim()];
      if (!entity) return { name: String(id) }; // Fallback to raw ID

      // Apply type filter (e.g., only show "Place" entities)
      if (
        typeFilter &&
        entity.type?.toLowerCase() !== typeFilter.toLowerCase()
      ) {
        return null;
      }

      // Generate URL based on authority configuration
      let url = undefined;
      if (isLinkable !== false && entity.authority) {
        const authKey = Object.keys(entity.authority).find(
          (key) => AUTHORITY_MAP[key]
        );
        if (authKey) {
          url = `${AUTHORITY_MAP[authKey]}${entity.authority[authKey]}`;
        }
      }

      return { name: entity.name, url };
    })
    .filter((item): item is ResolvedEntity => item !== null);
};

/**
 * Main Extraction Engine
 * Transforms raw feature properties into UI-ready fields
 */
export const extractGenericPopupData = (
  feature: any,
  config: PopupFieldConfig[],
  entities: EntityMap = {}
): GenericPopupData => {
  const props = feature.properties || {};
  const fields: ProcessedField[] = [];

  config.forEach((conf) => {
    // Handle custom components (complex data concatination)
    if (conf.type === "custom") {
      fields.push({
        type: "custom",
        componentId: conf.componentId,
        params: conf.params,
        value: props[conf.field],
      });
      return;
    }

    // Handle composite logic (like header)
    if (conf.type === "composite" && conf.fields) {
      const resolvedParts = conf.fields.map((fieldName) => {
        const rawValue = props[fieldName];
        if (!rawValue) return "Unknown";

        if (conf.resolveEntities) {
          const resolved = resolveAndFilter(
            rawValue,
            entities,
            conf.entityTypeFilter,
            false
          );
          return resolved.length > 0
            ? resolved.map((r) => r.name).join(", ")
            : String(rawValue);
        }
        return String(rawValue);
      });

      // We push this as a standard 'header' or 'text' so the UI
      // components (MapPopup/MapWrapper) don't need to change... bad!?
      fields.push({
        type: conf.isHeader ? "header" : "text",
        label: conf.label,
        value: resolvedParts.join(conf.separator || " "),
      });
      return;
    }

    // handle Link-Buttons
    if (conf.type === "link-button") {
      const rawId = props[conf.field] ?? feature[conf.field];
      let url = "";

      if (rawId && conf.linkTemplate && AUTHORITY_MAP[conf.linkTemplate]) {
        url = `${AUTHORITY_MAP[conf.linkTemplate]}${rawId}`;
      }

      fields.push({
        label: conf.label,
        type: "link-button",
        value: rawId,
        url: url,
      });
      return;
    }

    // how to handle FeatureLists (aggregated values)
    if (conf.type === "feature-list") {
      const listValue =
        typeof props[conf.field] === "string"
          ? JSON.parse(props[conf.field])
          : props[conf.field];

      if (!Array.isArray(listValue)) return;

      fields.push({
        label: conf.label,
        type: "feature-list",
        value: listValue,
        meta: {
          listLabelField: conf.listLabelField,
          listSecondaryField: conf.listSecondaryField,
          detailTemplateId: conf.detailTemplateId,
        },
      });
      return;
    }

    // Standard data extraction
    let rawValue = props[conf.field] ?? feature[conf.field];
    if (rawValue === undefined || rawValue === null) return;

    let processedValue = rawValue;
    let fieldUrl: string | undefined = undefined;

    // Resolve Entities if requested
    if (conf.resolveEntities) {
      if (conf.type === "timed-list") {
        const listData =
          typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
        processedValue = listData.map((entry: any) => ({
          label: entities[entry[0]]?.name || entry[0],
          subLabel: entry[1],
        }));
      } else {
        const resolved = resolveAndFilter(
          rawValue,
          entities,
          conf.entityTypeFilter,
          conf.isLinkable
        );
        if (resolved.length === 0) return;

        // If it's a simple text field but we resolved it, take the first one
        if (conf.type === "text") {
          processedValue = resolved[0].name;
          fieldUrl = resolved[0].url;
        } else {
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
    url: props.url || props.source_url, // fallback for external links
  };
};
